import express from "express";
import { loginTravelAgent, signupTravelAgent } from "../controllers/travelAgent.controller.js";


const travelAgentRouter = express.Router();

travelAgentRouter.post('/signup', signupTravelAgent)
travelAgentRouter.post('/login', loginTravelAgent)


export default travelAgentRouter;