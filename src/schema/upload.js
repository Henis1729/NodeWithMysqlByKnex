import { gql } from 'apollo-server-express';

const uploadSchema = gql`
  scalar Upload

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Mutation {
    fileUpload(file: Upload!): String
  }
`;

export default uploadSchema