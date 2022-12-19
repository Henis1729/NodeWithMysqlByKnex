import { gql } from 'apollo-server-express';
export default gql`
  enum genderType {
      MALE
      FEMALE
  }

  enum ActivityType {
      NotVeryActive
      LightActive
      Active
  }
  enum typeOfGoalNutrition {
      Easy
      Normal
      Hard
      Extreme
  }
  enum goalType {
      LosingWeight
      IncreaseBodyConfidence
      FeelMoreEnergetic
      ImprovePhysicalWellBeing
      FollowMedicalAdvice
  }
  enum languageType {
      HINDI
      ENGLISH
      GUJARATI
  }
  enum bloodGroupType {
      AB_POSITIVE
      O_POSITIVE
      B_POSITIVE
      A_POSITIVE
      A_NEGATIVE
      O_NEGATIVE
      AB_NEGATIVE
      B_NEGATIVE
  }

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
  }

  input inputUser {
    NAME: String
  }

  input updateInputUser {
    USERID: Number!
    NAME: String
  }

  extend type Mutation {
    createUser(input: inputUser): User
    insertManyUser(input: [inputUser]): Boolean
    updateUser(input: updateInputUser): Boolean
    deleteUser(USERID: Number!): Boolean
  }

  extend type Subscription {
    userChange: UserSubscribe
  }

  type UserSubscribe {
      keyType : String
      data: User
  }
`;