import jwt from "jsonwebtoken";
import { UserInputError, AuthenticationError } from "apollo-server-express";
import pubsub, { EVENTS } from "../subscriptions";

const generateToken = async (user, secret, expiresIn) => {
    const { id, email } = user;
    return await jwt.sign({ id, email }, secret, { expiresIn });
};

export default {
    genderType: {
        MALE: "male",
        FEMALE: "female",
    },

    ActivityType: {
        NotVeryActive: "Not Very Active",
        LightActive: "Light Active",
        Active: "Active",
    },

    typeOfGoalNutrition: {
        Easy: "Easy",
        Normal: "Normal",
        Hard: "Hard",
        Extreme: "Extreme",
    },

    goalType: {
        LosingWeight: "Losing Weight",
        IncreaseBodyConfidence: "Increase Body Confidence",
        FeelMoreEnergetic: "Feel More Energetic",
        ImprovePhysicalWellBeing: "Improve Physical WellBeing",
        FollowMedicalAdvice: "Follow Medical Advice",
    },

    bloodGroupType: {
        AB_POSITIVE: "AB+",
        O_POSITIVE: "O+",
        B_POSITIVE: "B+",
        A_POSITIVE: "A+",
        A_NEGATIVE: "A-",
        O_NEGATIVE: "O-",
        AB_NEGATIVE: "AB-",
        B_NEGATIVE: "B-",
    },

    // courseResponse: {
    //   courseVideos: (getAllCoursePaginate) => getCourseVideoUrls(getAllCoursePaginate),
    //   docs: (getAllCoursePaginate) => getCourseDocsUrls(getAllCoursePaginate)
    // },
    // courseResponse1: {
    //   courseVideos: async (getCourseById) => getCourseVideoUrls(getCourseById),
    //   docs: async (getCourseById) => getCourseDocsUrls(getCourseById)
    // },

    Query: {
        getUserById: (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        // auditlog => requestDidStart -> willSendResponse (add log)

                        // get data
                        // // fullQury | half query

                        // query =`SELECTE ${fields || '*'} FROM ${tablename}`

                        // if (codtional) {
                        //   query = query + ` Where ${condition}`
                        // }

                        // error and response handle exceptional manage

                        connection.query(
                            `SELECT * FROM users WHERE USERID = ? `,
                            [USERID],
                            (error, results) => {
                                if (error) reject(error);
                                resolve(results[0]);
                                pool.releaseConnection(connection);
                                if (error) throw error;
                            }
                        );
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        getAllUser: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    pool.getConnection(async (err, connection) => {
                        if (err) reject(err);
                        /* ****************************** Direct query statement ******************************  */
                        connection.query("SELECT * FROM users", (error, results) => {
                            if (error) reject(error);
                            resolve(results);
                        });

                        /* ****************************** Automatic creation, cached and re-used by connection ******************************  */
                        connection.execute('select 1 + ? + ? as result', [5, 6], (err, rows) => {
                            if (err) reject(err);
                            console.log("🚀 ~ file: query.js:28 ~ connection.execute ~ rows", rows)
                        });
                        connection.unprepare('select 1 + ? + ? as result');

                        /* ****************************** Prepared statements ******************************  */
                        connection.prepare('select ? + ? as tests', (err, statement) => {
                            if (err) reject(err);
                            console.time("Test case 1")
                            statement.execute([1, 2], (err, rows) => {
                                if (err) reject(err);
                                console.log("🚀 ~ file: query.js:36 ~ statement.execute ~ rows", rows)
                            });
                            console.timeEnd("Test case 1");
                            console.time("Test case 2");
                            statement.execute([2, 5], (err, rows) => {
                                if (err) reject(err);
                                console.log("🚀 ~ file: query.js:51 ~ statement.execute ~ rows", rows)
                            });
                            console.timeEnd("Test case 2")
                            console.time("Test case 3")
                            statement.execute([10, 11], (err, rows) => {
                                if (err) reject(err);
                                console.log("🚀 ~ file: query.js:55 ~ statement.execute ~ rows", rows)
                            });
                            console.timeEnd("Test case 3")
                            statement.close();
                        });

                        /* ****************************** Using Promise Wrapper ******************************  */

                        pool.releaseConnection(connection);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        getAllUserWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        let sql1 = `SELECT COUNT(*) "Total" FROM users WHERE LOWER(NAME) LIKE LOWER('%${search}%')`;
                        connection.query(
                            `SELECT * FROM users WHERE LOWER(NAME) LIKE LOWER('%${search}%') ORDER BY ? ? LIMIT ?, ?`,
                            [sort?.key, sort?.order, (page - 1) * limit, limit],
                            (error, results) => {
                                if (error) throw error;
                                connection.query(sql1, (error, count) => {
                                    if (error) throw error;
                                    resolve({ count: count[0]?.Total, data: results });
                                    pool.releaseConnection(connection);
                                });
                            }
                        );
                    });
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
                    pool.getConnection((err, connection) => {
                        if (err) reject(err);
                        let id = nanoid();
                        connection.query(
                            `INSERT INTO users ( USERID, NAME ) VALUES (? ,?)`,
                            [id, input.NAME],
                            (error, results) => {
                                if (error) throw error;
                                else {
                                    pool.releaseConnection(connection);
                                    connection.query(
                                        `SELECT * FROM users WHERE USERID = ?`,
                                        [id],
                                        (err, response) => {
                                            if (err) reject(err);
                                            PubSub.publish(EVENTS.USER.USER_CREATED, { userChange: { keyType: 'INSERT', data: response[0] } })
                                            resolve(response[0]);
                                        }
                                    );
                                }
                            }
                        );
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        insertManyUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    let binds = input.map((val) => [+nanoid(), val.NAME]);
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        connection.query(
                            `INSERT INTO users ( USERID, NAME ) VALUES ? `,
                            [binds],
                            (error, results) => {
                                if (error) throw error;
                                else resolve(true);
                                PubSub.publish(EVENTS.USER.USER_CREATED, { userChange: { keyType: 'INSERT', data: results } })
                                pool.releaseConnection(connection);
                            }
                        );
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        updateUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        connection.query(
                            `UPDATE users SET NAME= ? WHERE USERID = ?`,
                            [input?.NAME, input?.USERID],
                            (error, results) => {
                                if (error) throw error;
                                else resolve(true);
                                PubSub.publish(EVENTS.USER.USER_UPDATED, { userChange: { keyType: 'UPDATE', data: results } })
                                pool.releaseConnection(connection);
                            }
                        );
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        deleteUser: (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                try {
                    pool.getConnection((err, connection) => {
                        if (err) throw err;
                        connection.query(
                            `DELETE FROM users WHERE USERID= ?`,
                            [USERID],
                            (error, results) => {
                                if (error) throw error;
                                else resolve(true);
                                PubSub.publish(EVENTS.USER.USER_UPDATED, { userChange: { keyType: 'DELETE', data: results } })
                                pool.releaseConnection(connection);
                            }
                        );
                    });
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