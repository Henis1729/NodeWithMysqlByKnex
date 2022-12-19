import { gql } from 'apollo-server-express';

export default gql`
    type userRef {
        id : ID
        firstName: String
        lastName: String
        email: String
    }

    type Blog {
        id : ID
        title: String
        description: String
        createdBy: ID
        updatedBy: ID
        createdAt: Date
        updatedAt: Date
    }

    type BlogRef {
        id : ID
        title: String
        description: String
        createdBy: userRef
        updatedBy: userRef
        createdAt: Date
        updatedAt: Date
    }

    type BlogPaginate {
        count: Int
        data: [BlogRef]
    }

    input blogInput {
        title: String
        description: String
    }

    input topStockSort {
        key: String
        type: Int
    }

    extend type Query {
        getBlog (id: ID) : BlogRef
        getBlogs : [BlogRef]
        getAllBlogs (page: Int limit: Int filter: String sort: topStockSort) : BlogPaginate
    }

    extend type Mutation {
        createBlog (input : blogInput!) : Blog @isAuth
    }

    extend type Subscription {
        blogChange : BlogSubscribe
    }

    type BlogSubscribe {
        keyType : String
        data: BlogRef
    }
`;