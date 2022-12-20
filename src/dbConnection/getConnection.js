import mysql from "mysql2";
import bluebird from "bluebird";
let { DEV, HOST, USERNAME, PASSWORD, DATABASE, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, DB_HOST } = process.env;

let config = {
  client: 'mysql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    pool: {
      min: 0,
      max: 7,
      afterCreate: function (conn, done) {
        conn.query('SELECT 1 + 1 as result', function (err, data) {
          if (err) {
            console.log("🚀 ~ file: getConnection.js:20 ~ err", err)
          } else {
            console.log("🚀 ~ file: getConnection.js:19 ~ data", data)
          }
        });
      }
    }
  },
  acquireConnectionTimeout: 10000,
  userParams: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  },
  log: {
    warn(message) {
      console.log("🚀 ~ file: getConnection.js:37 ~ warn ~ message", message)
    },
    error(message) {
      console.log("🚀 ~ file: getConnection.js:40 ~ error ~ message", message)
    },
    deprecate(message) {
      console.log("🚀 ~ file: getConnection.js:43 ~ deprecate ~ message", message)
    },
    debug(message) {
      console.log("🚀 ~ file: getConnection.js:46 ~ debug ~ message", message)
    },
  }
}

if (DEV) Object.assign(config, { debug: true, asyncStackTraces: true })

export const getConnectionKnex = async () => {
  try {
    const knex = require('knex')(config);
    return knex;
  } catch (err) {
    console.log("🚀 ~ file: getConnection.js:58 ~ getConnectionKnex ~ err", err)
    throw new Error(err);
  }
};

export const getConnectionDB = async () => {
  try {
    return mysql.createConnection({
      host: HOST,
      user: USERNAME,
      password: PASSWORD,
      Promise: bluebird
    });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export const getPool = async () => {
  try {
    return mysql.createPool({
      host: HOST,
      user: USERNAME,
      password: PASSWORD,
      database: DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
