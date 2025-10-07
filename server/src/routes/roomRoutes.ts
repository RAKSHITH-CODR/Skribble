import router from "express";
import { createRoom, getAllRooms, getRoom } from "../controllers/RoomController.js";
import { Middleware } from "../middlewares/middleware.js";

const roomRouter = router.Router();

roomRouter.post("/createroom", Middleware, createRoom);
roomRouter.get("/getroom/:roomId", Middleware, getRoom);
roomRouter.get('/', Middleware, getAllRooms);
export default roomRouter;