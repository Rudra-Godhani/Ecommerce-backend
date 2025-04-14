import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { sendContactMessage } from "../controller/contactUsController";

const router = express.Router();

router.post("/sendcontactmessage", isAuthenticated, sendContactMessage);
export default router;
