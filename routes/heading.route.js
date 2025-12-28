import express from "express";
import {  getHeadingByType,  updateHeadingByType } from "../controllers/heading.controller.js";

const headingRouter = express.Router();

headingRouter.get("/get-heading/:headingType", getHeadingByType)
headingRouter.put("/update-heading/:headingType", updateHeadingByType)

export default headingRouter;