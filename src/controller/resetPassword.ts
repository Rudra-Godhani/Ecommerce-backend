import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { User } from "../models/User";
import nodemailer from "nodemailer";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { validate } from "class-validator";

const userRepository = AppDataSource.getRepository(User);

// register user
export const forgotPassword = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email } = req.body;

        const userToValidate = userRepository.create({
            email,
        });

        const validationErrors = await validate(userToValidate, {
            skipMissingProperties: true,
        });
        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        // Check if username exists
        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            next(
                new ErrorHandler("No user found with this email address.", 404)
            );
            return;
        }

        const payload = {
            id: user.id,
        };

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            next(
                new ErrorHandler(
                    "Internal server error: JWT_SECRET is not defined in environment variables.",
                    500
                )
            );
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
                next(
                    new ErrorHandler(
                        "Failed to send reset email. Please try again later.",
                        500
                    )
                );
                return;
            } else {
                res.status(200).json({
                    success: true,
                    message:
                        "Password reset link sent successfully. Please check your email.",
                });
            }
        });
        //  catch (error) {
        //     console.error("Error during forgot password process:", error);
        //     res.status(500).json({
        //         success: false,
        //         message:
        //             "Something went wrong while processing your request. Please try again later.",
        //     });
        // }
    }
);

export const resetPassword = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        const userToValidate = userRepository.create({
            password: newPassword,
        });

        const validationErrors = await validate(userToValidate, {
            skipMissingProperties: true,
        });
        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            next(
                new ErrorHandler(
                    "NewPassword and ConfirmNewPassword don't match.",
                    400
                )
            );
        }

        if (!token) {
            next(new ErrorHandler("token is missing.", 404));
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            next(
                new ErrorHandler(
                    "Internal server error: JWT_SECRET is not defined in environment variables.",
                    500
                )
            );
            return;
        }

        const decoded = jwt.verify(token, secret) as {
            id: string;
        };

        if (!decoded) {
            next(new ErrorHandler("token is not valid.", 401));
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
        // catch (error) {
        //     console.error("Error during reset password process:", error);
        //     res.status(500).json({
        //         success: false,
        //         message:
        //             "Something went wrong while updatig password. Please try again later.",
        //     });
        // }
    }
);
