import express from "express";
import {
    createCheckoutSession,
    validateSession,
} from "../controller/paymentController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);
router.get("/validate-session", validateSession);

export default router;
