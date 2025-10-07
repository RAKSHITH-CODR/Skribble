import type { Request, Response } from "express";

import { RoomSchemaModel } from "../db/models/RoomSchema.js";


export async function createRoom(req: Request, res: Response) {
    try {
        const ownerId = req.body.userId;
        const ownerName = req.body.username;
        const { roomName, maxPlayers, maxRounds, isPrivate, gameMode } = req.body;
        if (!roomName || !maxPlayers || !maxRounds || !gameMode) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (isPrivate) {
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ message: "Password is required for private rooms" });
            }

            const room = await RoomSchemaModel.create({
                roomName,
                ownerName,
                ownerId,
                maxPlayers,
                maxRounds, isPrivate, password, gameMode
            })
            return res.status(201).json({ message: "Room created successfully", room, success: true });
        }
        const room = await RoomSchemaModel.create({
            roomName,
            ownerName,
            ownerId,
            maxPlayers,
            maxRounds, isPrivate, gameMode
        })

        return res.status(201).json({ message: "Room created successfully", room, success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export async function getRoom(req: Request, res: Response) {
    try {
        const { roomId } = req.params;
        if (!roomId) {
            return res.status(400).json({ message: "Room ID is required" });
        }

        const room = await RoomSchemaModel.findById(roomId).populate("players", "-password").populate("ownerId", "-password").populate("drawer", "-password");
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.status(200).json({ message: "Room fetched successfully", room, success: true });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllRooms(req: Request, res: Response){
    try {
        const rooms = await RoomSchemaModel.find().populate("players", "-password").populate("ownerId", "-password").populate("drawer", "-password");
        return res.status(200).json({ message: "Rooms fetched successfully", rooms, success: true });
    }catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyRooms(req: Request, res: Response){
    try {
        const userId = req.body.userId;
        const rooms = await RoomSchemaModel.find({ownerId : userId}).populate("players", "-password").populate("ownerId", "-password").populate("drawer", "-password");
        return res.status(200).json({ message: "Rooms fetched successfully", rooms, success: true });
    }catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}