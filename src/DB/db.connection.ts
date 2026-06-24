import { connect } from "mongoose";
import { UserModel } from "./models/User.model.js";
import { TokenModel } from "./models/Token.model.js";

const connectDB = async (): Promise<void> => {
  try {
    const result = await connect(process.env.MONGO_URI as string);
    await UserModel.syncIndexes();
    await TokenModel.syncIndexes();
    console.log(result.models);
    console.log("MongoDB connected successfully 🚀");
  } catch (err) {
    console.error("Error connecting to MongoDB ❌", err);
  }
};

export default connectDB;
