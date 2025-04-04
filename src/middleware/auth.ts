import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { User } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);
interface AuthenticatedRequest extends Request {
    user?: User;
}

export const isAuthenticated = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { token } = req.cookies;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "user is not authenticated.",
            });
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error(
                "JWT_SECRET is not defined in environment variables."
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
            id: string;
        };

        if (!decoded) {
            res.status(401).json({
                status: false,
                message: "token is not valid",
            });
            return;
        }

        const user = await userRepository.findOne({
            where: { id: decoded.id },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user",
        });
    }
};
