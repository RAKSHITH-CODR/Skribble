import mongoose from "mongoose";


enum GameMode{
    Normal = "Normal",
    Hidden = "Hidden",
    Combination = "Combination"
}

const RoomSchema = new mongoose.Schema({
    roomName: { type: String, required: true, unique: true},
    ownerName: { type: String, required: true },
    ownerId : { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: "" },
    maxPlayers: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    players: [{ type: mongoose.Schema.ObjectId, ref: "User", required: true }],
    drawer: { type: mongoose.Schema.ObjectId, ref: "User" },
    currentWord: { type: String, default: "" },
    round: { type: Number, default: 0 },
    maxRounds: { type: Number, required: true },
    no_of_hints: { type: Number, default: 0 },

    hints : [{type : String}],
    gameMode: { type: String, enum: Object.values(GameMode), default: GameMode.Normal }
})

export const RoomSchemaModel = mongoose.model("Room", RoomSchema);          
