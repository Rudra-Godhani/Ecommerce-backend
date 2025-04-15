import { AppDataSource } from "../config/databaseConnection";
import { ErrorHandler } from "../middleware/errorHandler";
import { Order, User } from "../models/User";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";
import { NextFunction, Request, Response } from "express";

const orderRepository = AppDataSource.getRepository(Order);

interface AuthRequest extends Request {
    user?: User;
}

export const getMyOrders = catchAsyncErrorHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const orders = await orderRepository.find({
            where: { user: { id: req.user?.id } },
            relations: ["user", "orderItems", "address"],
            order: { createdAt: "DESC" },
        });

        res.status(200).json({ success: true, orders: orders });
    }
);

export const getMyOrderById = catchAsyncErrorHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { orderId } = req.params;

        if (!orderId) {
            next(new ErrorHandler("Order ID is required", 400));
            return;
        }

        const order = await orderRepository.findOne({
            where: {
                id: orderId,
                user: { id: req.user?.id },
            },
            relations: ["user", "orderItems", "address"],
        });

        if (!order) {
            next(new ErrorHandler("Order not found", 404));
            return;
        }
        res.status(200).json({ success: true, order: order });
    }
);
