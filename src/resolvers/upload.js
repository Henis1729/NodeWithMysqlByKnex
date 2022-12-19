import { join, parse } from "path";
import { createWriteStream } from "fs";
import { ApolloError } from "apollo-server-express";
import { GraphQLUpload } from 'graphql-upload'

export default {
  Upload: GraphQLUpload,
  Mutation: {
    fileUpload: async (_, { file }) => {
      try {
        const { filename, createReadStream } = await file;

        let stream = createReadStream();
        let { ext } = parse(filename);

        let serverFile = `${process.env.ASSETS_STORAGE}${Date.now()}${ext}`
        let writeStream = await createWriteStream(serverFile);
        await stream.pipe(writeStream);

        serverFile = `${serverFile.split("ASSETS")[1]}`;
        return serverFile;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
  },
};
