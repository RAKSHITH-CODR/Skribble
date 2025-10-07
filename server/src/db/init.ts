import mongoose from "mongoose";

export default async function initDb(){
    try {
        await mongoose.connect(process.env.MONGO_URI?.toString() || "");
        console.log("Connected to the database");   
    } catch (error) {
        console.log("Error connecting to the database", error);
    }
}