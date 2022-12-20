import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import "dotenv/config";
import typeDefs from "./schema";
import resolvers from "./resolvers";
import { createServer, request } from "http";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { graphqlUploadExpress } from "graphql-upload";
import { Buffer } from 'buffer';
import cors from "cors";
import fs from "fs";
import { connectDB } from "./dbConnection";
import { getPool } from "./dbConnection/getConnection";
let ObjectId = mongoose.Types.ObjectId;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const getMe = async (req) => {
  const token = req.headers["x-token"];
  if (token) {
    try {
      const me = await jwt.verify(token, process.env.SECRET);
      const pool = await getPool();
      pool.getConnection((err, connection) => {
        if (err) throw err;
        connection.query(`SELECT * FROM users WHERE USERID = ? `, [me?.id], (error, results) => {
          if (error) reject(error);
          me = results[0];
        });
      });
      pool.releaseConnection(connection);
      return me;
    } catch (e) {
      throw new AuthenticationError("Session Invalid or expired.");
    }
  }
};

async function startServer() {
  const httpServer = createServer(app);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const server = new ApolloServer({
    schema,
    formatError: (error) => {
      const message = error.message
        .replace("SequelizeValidationError: ", "")
        .replace("Validation error: ", "")
        .replace("Unexpected error value: ", "")
        .replace("Context creation failed: ", "");

      return { ...error, message };
    },
    formatResponse: (response) => response,
    context: async ({ req, connection, res }) => {
      const pool = await getPool();
      if (connection) {
        return {
          pool,
        };
      }
      if (req) {
        // const me = await getMe(req);
        let me;
        return {
          pool,
          me,
          secret: process.env.SECRET,
          res,
        };
      }
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },


    ],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect() { },
    },
    {
      server: httpServer,
      path: server.graphqlPath,
    }
  );

  await server.start();
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });
  connectDB().then(async () => {
    httpServer.listen(process.env.PORT, () =>
      console.log(
        `Server is now running on http://localhost:${process.env.PORT}/graphql`
      )
    );
  });
}

startServer();
