import { gql } from 'apollo-server-express';

export default gql`
    type Token {
        token : String
        user : User
    }

    type User {
        id : ID
        firstName: String
        lastName: String
        userName: String
        email: String
        phone: Number
        age:Int
        gender: String
        dob: Date
        isActive: Boolean
        createdAt: Date
        updatedAt: Date
    }

    input userInput {
        firstName: String
        lastName: String
        userName: String
        email: String
        phone: Number
        password: String
        gender: String
        dob: Date
        isActive: Boolean
    }

    type UserPaginate {
        count: Int
        data: [User]
    }

    input userSort {
        key: String
        type: Int
    }

    extend type Query {
        me : User
        getUsers : [User]
        getAllUsers(page: Int limit: Int filter: String sort: userSort) : UserPaginate
    }

    extend type Mutation {
        signUp (input : userInput!) : User
        signIn (email : String!, password : String!) : Token!
        updateUser(input : userInput!) : User
        deleteUser(id : ID!) : Boolean!
    }

    extend type Subscription {
        userChange : UserSubscribe
    }

    type UserSubscribe {
        keyType : String
        data: User
    }
`;