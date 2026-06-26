import mongoose from "mongoose"

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ DB Connection succesfull ")
    } catch (error) {
        console.error("❌ Mongoose connection failed!! ",error);
        process.exit(1);
    }
}

export default connectDB;