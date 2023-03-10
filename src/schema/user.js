import { gql } from 'apollo-server-express';
export default gql`
  extend type Query {
      getUserById(USERID: Number!): User
      getAllUser: [User]
      getAllUserWithPaginate(page:Number, limit:Number, search: String, sort: typeSort): paginateResponse
  }

  enum typeOrder {
    ASC
    DESC
  }

  input typeSort {
    key: String
    order: typeOrder
  }

  type paginateResponse {
    count: Number 
    data: [User]
  }

  type User {
    USERID: Number
    NAME: String
    password: String
  }

  input inputUser {
    NAME: String
  }

  input updateInputUser {
    USERID: Number!
    NAME: String
  }

  type userTokenResponse {
    token: String 
    data: User
  }
  
  input inputSignUp {
    name: String
    password: String
  }

  extend type Mutation {
    createUser(input: inputUser): User
    insertManyUser(input: [inputUser]): Boolean
    updateUser(input: updateInputUser): Boolean
    deleteUser(USERID: Number!): Boolean
    signUpUser(input: inputSignUp):userTokenResponse
    loginUser(id: String , password: String): userTokenResponse
  }

  extend type Subscription {
    userChange: UserSubscribe
  }

  type UserSubscribe {
    keyType: String
    data: User
  }
`;