import mongoose from "mongoose";
mongoose.set('strictQuery', true);
import User from "./user";

const connectDB = () => {
  return mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const models = {
  User,
};

export { connectDB };
export default models;
