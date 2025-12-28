import { login, refreshAccessToken, signup } from "../controllers/admin.controller.js";
import express from "express";
import { getCars } from "../controllers/cars.controller.js";

const adminRouter = express.Router();

// adminRouter.post('/signup', signup)
adminRouter.post('/login', login)
adminRouter.get("/refreshAccessToken", refreshAccessToken)
adminRouter.get("/get-cars", getCars)

export default adminRouter;