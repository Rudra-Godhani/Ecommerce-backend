import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { getMyOrderById, getMyOrders } from "../controller/orderController"

const router = express.Router();

router.get("/getmyorders", isAuthenticated, getMyOrders);
router.get("/getmyorderbyid/:orderId", isAuthenticated, getMyOrderById);

export default router;
