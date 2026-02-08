import mongoose from "mongoose";
import { ApiError } from "../utils/api-error.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("🥰🥰MongoDB Connected🥰🥰")
    } catch (error) {
        console.log("👻👻Database Connection Establishment Failed👻👻");
        process.exit(1)
    }
}

export default connectDB;