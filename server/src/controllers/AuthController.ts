import type { Request, Response } from 'express';
import jwt from "jsonwebtoken"
import { UserSchemaModel } from '../db/models/UserSchema.js';
import bcrypt from "bcrypt"
export async function Signup(req: Request, res: Response) {

    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const isUser = await UserSchemaModel.findOne({ $or: [{ username }, { email }] });
        if (isUser) {
            return res.status(401).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserSchemaModel.create({
            username,
            password: hashedPassword,
            email
        })
        return res.status(201).json({ message: "User created successfully", newUser, success: true });



    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function Login(req: Request, res: Response) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await UserSchemaModel.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username
        }, process.env.JWT_SECRET?.toString() || "", { expiresIn: "1d" });
        return res.status(200).json({
            token, message: "Login successful", user: {
                user
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function GetMe(req: Request, res: Response) {

    try {
        const userId = req.body.userId;
        const user = await UserSchemaModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user , message: "User fetched successfully"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

}
export async function UpdateUser(req: Request, res: Response) {

    try {
        const userId = req.body.userId;
        const {data} = req.body;
        const user = await UserSchemaModel.findByIdAndUpdate(userId, {...data}, { new: true }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ user, message: "User updated successfully" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }

}