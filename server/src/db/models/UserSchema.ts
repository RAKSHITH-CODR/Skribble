import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    highestScore: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    photoUrl: { type: String, default: "" }
})


export const UserSchemaModel = mongoose.model("User", UserSchema);