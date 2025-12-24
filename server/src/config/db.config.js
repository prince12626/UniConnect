import mongoose from "mongoose";

const connectDB = async () => {
            const uri = process.env.MONGODB_URI;
            if (!uri) {
                throw new Error("Please provide MONGO_URI in the environment variables");
            }
            try {
                await mongoose.connect(uri);
                console.log("📊 MongoDB connected");
            } catch (error) {
                console.error(error);
            }
};

export default connectDB;
