import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";
import { ErrorHandler } from "./errorHandler";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);
interface AuthenticatedRequest extends Request {
    user?: User;
}

export const isAuthenticated = catchAsyncErrorHandler(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { token } = req.cookies;
        if (!token) {
            next(new ErrorHandler("User is not authenticated.", 401));
            return;
        }

        if (!process.env.JWT_SECRET) {
            next(new ErrorHandler("JWT_SECRET is not found.", 404));
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            id: string;
        };

        if (!decoded) {
             next(new ErrorHandler("token is invalid.", 401));
             return;
        }

        const user = await userRepository.findOne({
            where: { id: decoded.id },
        });

        if (!user) {
            next(new ErrorHandler("User not found.", 404));
            return;
        }

        req.user = user;
        next();
    }
);
