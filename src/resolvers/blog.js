import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import pubsub, { EVENTS } from '../subscriptions/';

export default {
    Query: {
        getBlog: (parent, { id }, { models, me }) => {
            return new Promise((resolve, reject) => {
                models.Blog.findById(id).populate([
                    { path: "createdBy", select: "id firstName lastName email" },
                    { path: "updatedBy", select: "id firstName lastName email" }
                ]).exec((err, res) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(res);
                })
            })
        },

        getBlogs: (parent, args, { models }) => {
            return new Promise((resolve, reject) => {
                models.Blog.find({ isDeleted: false }).populate([
                    { path: "createdBy", select: "id email" },
                    { path: "updatedBy", select: "id email" }
                ]).exec((err, res) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                })
            })
        },

        getAllBlogs: combineResolvers(isAuthenticated, (parent, args, { models }) => {
            return new Promise((resolve, reject) => {
                let filter = JSON.parse(args.filter);
                const sort = { [args.sort.key]: args.sort.type };
                Object.keys(filter).forEach(data => {
                    if (data == "name") {
                        filter[data] = { name: filter[data] }
                    }
                })
                models.Blog.paginate(
                    { ...filter, isDeleted: false },
                    {
                        page: args.page,
                        limit: args.limit,
                        sort: sort,
                        populate: [
                            { path: "createdBy", select: "id email" },
                            { path: "updatedBy", select: "id email" }
                        ]
                    }
                ).then((res) => {
                    resolve({ count: res.totalDocs, data: res.docs })
                }).catch((err) => {
                    reject(err);
                })
            })
        })
    },
    Mutation: {
        createBlog: combineResolvers(isAuthenticated, (parent, { input }, { models, me }) => {
            return new Promise((resolve, reject) => {
                const userId = me && me._id
                input['createdBy'] = userId;
                input['updatedBy'] = userId;

                models.Blog.create(input, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        models.Blog.paginate({ _id: res._id },
                            {
                                populate: [
                                    { path: 'createdBy', select: "id email" },
                                    { path: 'updatedBy', select: "id email" }
                                ]
                            }).then((resp) => {
                                pubsub.publish(EVENTS.BLOG.BLOG_CREATED, {
                                    blogChange: { keyType: 'INSERT', data: resp.docs[0] }
                                })
                                resolve(res);
                            })
                    }
                })
            })
        })
    },


    Subscription: {
        blogChange: {
            subscribe: () => pubsub.asyncIterator([EVENTS.BLOG.BLOG_CREATED, EVENTS.BLOG.BLOG_UPDATED, EVENTS.BLOG.BLOG_DELETED]),
        },
    },
}