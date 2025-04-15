import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { User } from "../models/User";
import { ErrorHandler } from "../middleware/errorHandler";
import { validate } from "class-validator";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";

const userRepository = AppDataSource.getRepository(User);

export const register = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { name, email, password } = req.body;

        const newUser = userRepository.create({
            name,
            email,
            password,
        });

        const validationErrors = await validate(newUser, {
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

        const usernameExists = await userRepository.findOne({
            where: { name },
        });
        if (usernameExists) {
            next(new ErrorHandler("Username is already used", 400));
            return;
        }

        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
            next(new ErrorHandler("Email is already used", 400));
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        newUser.password = hashedPassword;

        await userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: userWithoutPassword,
        });
    }
);

export const login = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { email, password } = req.body;

        const userToValidate = userRepository.create({
            email,
            password,
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

        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            next(
                new ErrorHandler(
                    "User is not registered,Please signup first",
                    400
                )
            );
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            const payload = {
                id: user.id,
            };

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                next(new ErrorHandler("JWT_SECRET is not found.", 400));
                return;
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: "7d",
            });

            user.token = token;
            await userRepository.save(user);
            const { password: _, ...userWithoutPassword } = user;

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }).status(200).json({
                success: true,
                token,
                user: userWithoutPassword,
                message: "User Logged in successfully",
            });
        } else {
            next(new ErrorHandler("Password is incorrect", 400));
            return;
        }
    }
);

export const logout = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "User Logged out successfully",
        });
    }
);

export const getAllUsers = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const users = await userRepository.find();
        res.status(200).json({
            success: true,
            users: users,
        });
    }
);

interface AuthenticatedRequest extends Request {
    user?: User;
}

export const getUser = catchAsyncErrorHandler(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const user = req.user;
        res.status(200).json({
            success: true,
            user,
        });
    }
);

interface AuthAndFileRequest extends Request {
    user?: User;
    files?: { [key: string]: UploadedFile | UploadedFile[] } | null;
}
export const updateProfile = catchAsyncErrorHandler(
    async (
        req: AuthAndFileRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { name, email, phoneNumber } = req.body;

        let userNewData = userRepository.create({
            name: name,
            email: email,
            profileImage: (req.user as User).profileImage,
        });
        if (phoneNumber) {
            userNewData.phoneNumber = phoneNumber;
        }

        const validationErrors = await validate(userNewData, {
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

        const users = await userRepository.find();

        const filteredUser = users.filter(
            (user) => user.id !== (req.user as User).id
        );

        const emailExist = filteredUser.find(
            (user) => user.email === req.body.email
        );
        if (emailExist) {
            next(new ErrorHandler("Email is already used", 400));
            return;
        }

        if (req.files && req.files.profileImage) {
            const profileImage = req.files.profileImage;
            if (profileImage) {
                const currentProfileImageId = (req.user as User).profileImage
                    .public_id;
                if (currentProfileImageId) {
                    await cloudinary.uploader.destroy(currentProfileImageId);
                }

                const tempFilePath = (profileImage as UploadedFile)
                    .tempFilePath;

                const newProfileImage = await cloudinary.uploader.upload(
                    tempFilePath,
                    {
                        folder: "User_Profile_Image",
                    }
                );

                userNewData.profileImage = {
                    public_id: newProfileImage.public_id,
                    url: newProfileImage.secure_url,
                };
            }
        }

        await userRepository.update((req.user as User).id, userNewData);

        const updatedUser = await userRepository.findOne({
            where: { id: (req.user as User).id },
        });

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully",
        });
    }
);

export const updatePassword = catchAsyncErrorHandler(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword) {
            next(new ErrorHandler("Current password is required.", 400));
            return;
        }

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
            return;
        }

        const user = await userRepository.findOne({
            where: { id: (req.user as User).id },
        });

        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        const isPasswordMatched = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );

        if (!isPasswordMatched) {
            next(new ErrorHandler("Current password is incorrect", 400));
            return;
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        await userRepository.save(user);
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
);
