import express from 'express';
import { Signup, Login, GetMe, UpdateUser } from '../controllers/AuthController.js';
import { Middleware } from '../middlewares/middleware.js';
const router = express.Router();

router.post('/signup', Signup);
router.post('/login', Login);
router.get('/getme', Middleware, GetMe);
router.patch('/updateuser', Middleware, UpdateUser);


export default router;  