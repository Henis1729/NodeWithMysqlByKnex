import { getConnectionDB, getConnectionKnex, getPool } from "./getConnection";

const connectDB = async () => {
  getConnectionKnex()
    .then((pool) => {
      console.log("Database connection successful");
      return pool;
    })
    .catch((err) => {
      console.log("Database connection error : ", err);
    });
};
export { connectDB };
