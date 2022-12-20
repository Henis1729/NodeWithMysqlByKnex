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
import { getPool, getConnectionKnex } from "./dbConnection/getConnection";
import { findUsersBy } from "./data-access/user";
import router from "./router";
let ObjectId = mongoose.Types.ObjectId;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/", express.static(process.env.ASSETS_STORAGE));
app.use("/", router)

// app.use('/graphql', (req, res, next) => {
//   console.log(JSON.stringify(req.body.query))
//   return next()
// })

ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const getMe = async (req) => {
  const token = req.headers["x-token"];
  if (token) {
    try {
      const me = await jwt.verify(token, process.env.SECRET);
      let user = await findUsersBy('USERID', me?.id)
      return user;
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
        const me = await getMe(req);
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
          console.log('Server starting!');
          return {
            // async drainServer() {
            //   subscriptionServer.close();
            // },
            async serverWillStop(o) {
              console.log("🚀 ~ file: index.js:92 ~ serverWillStop ~ o", o)
              console.log('Response sendedd ');
            },
          };
        },
      },
      // {
      //   async requestDidStart(requestContext) {
      //     console.log('Request started!');

      //     return {
      //       async parsingDidStart(requestContext) {
      //         console.log('Parsing started!');
      //       },

      //       async validationDidStart(requestContext) {
      //         console.log('Validation started!');
      //       },
      //     };
      //   },
      // }


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
