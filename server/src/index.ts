import express from "express";
import dotenv from "dotenv";    
import initDb from "./db/init.js";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import cors from "cors"
import http from "http"
import { initSocket } from "./Sockets.js";
const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.locals.io = io;


app.use(express.json());
app.use(cors())
app.use("/api/auth",authRoutes);
app.use("/api/room",roomRoutes);
dotenv.config();


async function main(){
    await initDb();
    server.listen(process.env.PORT || 3000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
}
main();