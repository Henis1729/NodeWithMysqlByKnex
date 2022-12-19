import mysql from "mysql2";
import bluebird from "bluebird";
let { DEV, HOST, USERNAME, PASSWORD, DATABASE } = process.env;

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
