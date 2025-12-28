import { refreshAccessToken } from "../controllers/admin.controller.js";
import { addOrderToUser, getAllUsers, getCurrentUser,  getUserWithOrders, loginUser, signupUser } from "../controllers/user.controller.js";
import express from "express";

const userRouter = express.Router();

userRouter.post('/signup', signupUser)
userRouter.post('/login', loginUser)
userRouter.get('/getCurrentUser', getCurrentUser)
userRouter.get('/refreshAccessToken', refreshAccessToken)
userRouter.get('/getAll', getAllUsers)
userRouter.get('/userOrders/:userId', getUserWithOrders)
userRouter.post('/addOrderToUser', addOrderToUser)

export default userRouter;