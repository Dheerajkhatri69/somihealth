import mongoose from "mongoose";
import { connectionSrt } from "./db";

export const connectMongoDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(connectionSrt);
    }
    // console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error);
    throw error; // Re-throw the error so it can be handled by the calling code
  }
};
