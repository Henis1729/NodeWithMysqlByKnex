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
import { insertPredefineData } from "./fixture";
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
      // return await models.User.findById(me.id);
      return me;
    } catch (e) {
      throw new AuthenticationError("Session Invalid or expired.");
    }
  }
};

// var options = {
//   method: "GET",
//   hostname: "rest.coinapi.io",
//   port: null,
//   "path": "/v1/assets",
//   headers: {
//     "x-coinapi-key": "F52750E3-866F-424B-BFE5-8003F784EC63",
//     "cache-control": "no-cache",
//   },
// };

// var req = request(options, function (res) {
//   var chunks = [];

//   res.on("data", function (chunk) {
//     chunks.push(chunk);
//   });

//   res.on("end", function () {
//     var body = Buffer.concat(chunks);

//     fs.writeFile(
//       "/Users/deepak/Nikul/ApolloServerV3-master/assets.json",
//       body.toString(),
//       (err) => {
//         if (err) console.log(err);
//         else {
//           console.log("File written successfully\n");
//         }
//       }
//     );
//   });
// });

// req.end();

// const server = new ApolloServer({
//     typeDefs : schema,
//     resolvers,
//     schemaDirectives,
//     formatError : error => {
//         const message = error.message
//         .replace('SequelizeValidationError: ', '')
//         .replace('Validation error: ', '')

//       return { ...error, message };
//     },
//     formatResponse : response => response,
//     context : async ({req, res}) => {
//         if(req){
//             const me = await getMe(req)
//             return {
//                 models,
//                 me,
//                 secret: process.env.SECRET
//             }
//         }
//     }
// })

// server.applyMiddleware({ app, path : '/graphql' });
// const httpServer = http.createServer(app);
// server.installSubscriptionHandlers(httpServer)

// connectDB().then( async () => {
//     httpServer.listen({ port }, () => {
//         console.log(`Apollo Server on http://localhost:${port}/graphql`);
//     })
// } )

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
    // await insertPredefineData(models);
    httpServer.listen(process.env.PORT, () =>
      console.log(
        `Server is now running on http://localhost:${process.env.PORT}/graphql`
      )
    );
  });
}

startServer();
