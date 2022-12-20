import { getPool, getConnectionKnex } from "../dbConnection/getConnection";
import { customAlphabet } from 'nanoid/async'
const nanoid = customAlphabet('1234567890', 5)

export const listUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let data = await knex.raw(`SELECT * FROM users`)
            resolve(data[0])
        } catch (error) {
            console.log("🚀 ~ file: user.js:9 ~ returnnewPromise ~ error", error)
            reject(error);
        }
    })
}

export const findUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let data = await knex.raw(`SELECT * FROM users WHERE USERID = ? `, [id])
            resolve(data[0][0])
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const listUserWithPaginate = (page, limit, search, sort) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let countData = await knex.raw(`SELECT COUNT(*) "Total" FROM users WHERE LOWER(NAME) LIKE LOWER('%${search}%')`)
            let resultData = await knex.raw(`SELECT * FROM users WHERE LOWER(NAME) LIKE LOWER('%${search}%') ORDER BY ${sort?.key} ${sort?.order} LIMIT ${(page - 1) * limit}, ${limit}`)
            resolve({ count: countData[0][0]?.Total, data: resultData[0] })
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const findUsersBy = (prop, val) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let resultData = await knex.raw(`SELECT * FROM users WHERE ${prop}='${val}' `)
            resolve(resultData[0])
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const addUser = (name, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let id = await nanoid();
            let insertedData = await knex.raw(`INSERT INTO users ( USERID,NAME,password) VALUES ( ? , ? , ? );`, [id, name, password]);
            if (insertedData) {
                let resultData = await knex.raw(`SELECT * FROM users WHERE USERID= ?`, [id])
                if (resultData) resolve(resultData[0][0])
            } else {
                reject("Please insert data again")
            }
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const addUsers = (input) => {
    return new Promise(async (resolve, reject) => {
        try {
            let binds = [];
            process.nextTick(() => {
                input.map(async (val) => {
                    let id = await nanoid()
                    binds.push([+id, val.NAME])
                });
            });
            let knex = await getConnectionKnex()
            let insertedData = await knex.raw(`INSERT INTO users ( USERID, NAME ) VALUES ? `, [binds])
            if (insertedData) resolve(true);
            else resolve(false);
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const updateUsers = (name, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let updatedData = await knex.raw(`UPDATE users SET NAME=? WHERE USERID=?;`, [name, id])
            console.log("🚀 ~ file: user.js:101 ~ returnnewPromise ~ updatedData", updatedData)
            if (updatedData) resolve(true)
            else resolve(false)
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}

export const deleteStudent = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let knex = await getConnectionKnex()
            let deletedData = await knex.raw(`DELETE FROM users WHERE USERID= ?`, [id])
            if (deletedData) resolve(true)
            else resolve(false)
        } catch (error) {
            console.log("🚀 ~ file: user.js:22 ~ returnnewPromise ~ error", error)
            reject(error)
        }
    })
}