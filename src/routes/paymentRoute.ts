import express from "express";
import {
    createCheckoutSession,
    handleStripeWebhook,
} from "../controller/paymentController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/create-checkout-session", isAuthenticated, createCheckoutSession);
// router.post(
//     "/webhook",
//     express.raw({ type: "application/json" }),
//     handleStripeWebhook
// );

export default router;
