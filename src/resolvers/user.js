import jwt from "jsonwebtoken";
import pubsub, { EVENTS } from "../subscriptions";
import { addUser, addUsers, deleteStudent, findUser, listUser, listUserWithPaginate, updateUsers } from "../data-access/user";

const generateToken = async (user, secret, expiresIn) => {
    const { id, email } = user;
    return await jwt.sign({ id, email }, secret, { expiresIn });
};

export default {
    Query: {
        getUserById: (parent, { USERID }, { }) => {
            return new Promise(async (resolve, reject) => {
                findUser(USERID).then((user) => {
                    resolve(user)
                }).catch(error => {
                    reject(error)
                })
            });
        },

        getAllUser: (parent, args, { }) => {
            return new Promise(async (resolve, reject) => {
                listUser().then((users) => {
                    resolve(users)
                }).catch((err) => {
                    reject(err)
                })
            });
        },

        getAllUserWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    let paginatedUsers = await listUserWithPaginate(page, limit, search, sort)
                    resolve({ count: paginatedUsers?.count, data: paginatedUsers?.data })
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
    Mutation: {
        createUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let addedUser = await addUser(input.NAME);
                    resolve(addedUser);
                } catch (error) {
                    reject(error);
                }
            });
        },

        insertManyUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    addUsers(input).then(data => {
                        if (data) resolve(true);
                    }).catch(error => {
                        reject(error)
                    })
                } catch (error) {
                    reject(error);
                }
            });
        },

        updateUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    updateUsers(input?.NAME, input?.USERID).then(data => {
                        if (data) resolve(true);
                    }).catch(error => {
                        reject(error)
                    })
                } catch (error) {
                    reject(error);
                }
            });
        },

        deleteUser: (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    deleteStudent(USERID).then(data => {
                        if (data) resolve(true)
                    }).catch(error => {
                        reject(error)
                    })
                } catch (error) {
                    reject(error);
                }
            });
        },
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