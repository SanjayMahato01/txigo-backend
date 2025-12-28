import express from "express";
import { createPromotionalEmail, deletePromotionalEmail } from "../controllers/promotionalEmail.controller.js";

const router = express.Router();

router.post("/promotional-emails", createPromotionalEmail);
router.delete("/promotional-emails/:id", deletePromotionalEmail);

export default router;
