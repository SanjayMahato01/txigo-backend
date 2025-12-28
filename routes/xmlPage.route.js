import express from "express";
import { createXmlPage, getAllXmlPages } from "../controllers/xmlPage.controller.js";

const XmlPageRouter = express.Router();

XmlPageRouter.post("/add", createXmlPage);              
XmlPageRouter.get("/get", getAllXmlPages);              
       

export default XmlPageRouter;
