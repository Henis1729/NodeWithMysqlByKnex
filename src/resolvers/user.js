import pubsub, { EVENTS } from "../subscriptions";
import { addUser, addUsers, deleteStudent, findUser, findUsersBy, listUser, listUserWithPaginate, updateUsers } from "../data-access/user";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./authorization";
import { convertHash, verifyPassword } from "../functions/createHashpw";
import { generateToken } from "../functions/common";

export default {
    Query: {
        getUserById: combineResolvers(isAuthenticated, (parent, { USERID }, { }) => {
            return new Promise(async (resolve, reject) => {
                if (!USERID) reject("Plase provide UserId ")
                findUser(USERID)
                    .then((user) => { resolve(user); })
                    .catch(error => { reject(error); })
            });
        }),

        getAllUser: combineResolvers(isAuthenticated, (parent, args, { }) => {
            return new Promise(async (resolve, reject) => {
                listUser()
                    .then((users) => { resolve(users) })
                    .catch((err) => { reject(err) })
            });
        }),

        getAllUserWithPaginate: combineResolvers(isAuthenticated, (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let { page, limit, search, sort } = args;
                    if (!page, !limit, !search, !sort) reject("Please Provide proper input ")
                    let paginatedUsers = await listUserWithPaginate(page, limit, search, sort)
                    resolve({ count: paginatedUsers?.count, data: paginatedUsers?.data })
                } catch (error) {
                    reject(error);
                }
            });
        }),
    },
    Mutation: {
        signUpUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!input.name || !input.password) reject("Please provide username and password")
                    let password = convertHash(input.password);
                    let addedUser = await addUser(input?.name, password);
                    let token = generateToken({ id: addedUser?.USERID }, process.env.SECRET, "90d")
                    resolve({ token: token, data: addedUser });
                } catch (error) {
                    reject(error);
                }
            });
        },

        loginUser: (parent, { id, password }, { }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    if (!id || !password) reject("Please provide username and password")
                    let user = await findUsersBy('USERID', id)
                    if (!user) reject("User not found")
                    let resultPW = verifyPassword(password, user[0]?.password)
                    if (resultPW) {
                        let token = generateToken({ id: user[0]?.USERID }, process.env.SECRET, "90d")
                        resolve({ token: token, data: user });
                    }
                } catch (error) {
                    reject(error);
                }
            });
        },



        createUser: combineResolvers(isAuthenticated, (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let addedUser = await addUser(input.NAME);
                    resolve(addedUser);
                } catch (error) {
                    reject(error);
                }
            });
        }),

        insertManyUser: combineResolvers(isAuthenticated, (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    addUsers(input)
                        .then(data => { if (data) resolve(true); })
                        .catch(error => { reject(error) })
                } catch (error) {
                    reject(error);
                }
            });
        }),

        updateUser: combineResolvers(isAuthenticated, (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    updateUsers(input?.NAME, input?.USERID)
                        .then(data => { if (data) resolve(true); })
                        .catch(error => { reject(error) })
                } catch (error) {
                    reject(error);
                }
            });
        }),

        deleteUser: combineResolvers(isAuthenticated, (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    deleteStudent(USERID)
                        .then(data => { if (data) resolve(true) })
                        .catch(error => { reject(error) })
                } catch (error) {
                    reject(error);
                }
            });
        }),
    },
    Subscription: {
        userChange: {
            subscribe: () =>
                pubsub.asyncIterator([
                    EVENTS.USER.USER_CREATED,
                    EVENTS.USER.USER_UPDATED,
                    EVENTS.USER.USER_DELETED,
                ]),
        },
    },
};

const getCourseDocsUrls = async (queryName) => {
    return queryName?.docs?.map(async (file) => {
        let bucketParams;
        let url;
        if (file?.file) {
            bucketParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: "course/" + file.file,
            };
            url = await getVideoFileFromS3(bucketParams);
            file.file = url;
        }
        return file;
    });
}

const getCourseVideoUrls = async (queryName) => {
    return queryName?.courseVideos?.map(async (filename) => {
        let bucketParams;
        let url;
        if (filename?.video) {
            bucketParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: filename.video,
            };
            url = await getVideoFileFromS3(bucketParams);
            filename.video = url;
        }
        return filename;
    });
}