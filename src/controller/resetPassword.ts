import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { User } from "../models/User";
import nodemailer from "nodemailer";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);

// register user
export const forgotPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.body;

        // Check if username exists
        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "No account found with this email address.",
            });
            return;
        }

        const payload = {
            id: user.id,
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({
                success: false,
                message:
                    "Internal server error: JWT_SECRET is not defined in environment variables",
            });
            return;
        }

        const token = jwt.sign(payload, secret, {
            expiresIn: "5m",
        });

        let transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        var mailOptions = {
            from: "Authentication",
            to: `${email}`,
            subject: "Reset Password",
            text: `Click the link below to reset your password:\n\n ${process.env.FRONTEND_URL}/resetPassword/${token} \n\nThis link will expire in 5 minutes.`,
        };

        transport.sendMail(mailOptions, function (error, info) {
            if (error) {
                res.status(500).json({
                    success: false,
                    message:
                        "Failed to send reset email. Please try again later.",
                });
                return;
            } else {
                res.status(200).json({
                    success: true,
                    message:
                        "Password reset link sent successfully. Please check your email.",
                });
            }
        });
    } catch (error) {
        console.error("Error during forgot password process:", error);
        res.status(500).json({
            success: false,
            message:
                "Something went wrong while processing your request. Please try again later.",
        });
    }
};

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!token) {
            res.status(404).json({
                success: false,
                message: "token is missing.",
            });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({
                success: false,
                message:
                    "Internal server error: JWT_SECRET is not defined in environment variables",
            });
            return;
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
        };

            if (!decoded) {
                res.status(401).json({
                    success: false,
                    message: "token is not valid",
                });
                return;
            }

        const id = decoded.id;

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await userRepository.update(id, {
            password: hashedPassword,
        });

        res.status(200).json({
            success: true,
            message: "Password updated successfullly",
        });
    } catch (error) {
        console.error("Error during reset password process:", error);
        res.status(500).json({
            success: false,
            message:
                "Something went wrong while updatig password. Please try again later.",
        });
    }
};
