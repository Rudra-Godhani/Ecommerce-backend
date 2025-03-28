import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { User } from "../models/User";
import { ErrorHandler } from "../middleware/errorHandler";
import { validate } from "class-validator";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";

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

        // Check if username exists
        const usernameExists = await userRepository.findOne({
            where: { name },
        });
        if (usernameExists) {
            next(new ErrorHandler("Username is already used", 400));
            return;
        }

        // Check if email exists
        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
            next(new ErrorHandler("Email is already used", 400));
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        newUser.password = hashedPassword;

        await userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: userWithoutPassword,
        });
        // } catch (error) {
        // console.error("Error registering user:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "User cannot be registered. Please try again",
        //     });
        // }
    }
);

// login user
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

        // Check if user exists
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
                next(
                    new ErrorHandler(
                        "JWT_SECRET is not defined in environment variables",
                        400
                    )
                );
                return;
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: "7d",
            });

            user.token = token;
            await userRepository.save(user);
            const { password: _, ...userWithoutPassword } = user;

            const options = {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
                secure: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,  
                user: userWithoutPassword,
                message: "User Logged in successfully",
            });
        } else {
            next(new ErrorHandler("Password is incorrect", 400));
            return;
        }
        // console.error("Error LoggedIn user:", error);
        //         res.status(500).json({
        //             success: false,
        //             message: "Login Failure, please try again",
        //         });
    }
);

// logout
export const logout = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        res.clearCookie("token");
        res.status(200).json({
            success: true,
            message: "User Logged out successfully",
        });
    }
);

// get all users
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

// get user
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

// update profile

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
        const { name, email, phoneNumber, address } = req.body;

        let userNewData = userRepository.create({
            name: name,
            email: email,
            profileImage: (req.user as User).profileImage,
        });
        if (phoneNumber) {
            userNewData.phoneNumber = phoneNumber;
        }
        if (address) {
            userNewData.address = address;
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
        // catch (error) {
        //     console.error("Error While Updating Profile:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Failed Upadting Profile, please try again",
        //     });
        // }
    }
);

// update Password
export const updatePassword = catchAsyncErrorHandler(
    async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword) {
            return next(new ErrorHandler("Current password is required.", 400));
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
            return next(
                new ErrorHandler(
                    "NewPassword and ConfirmNewPassword don't match.",
                    400
                )
            );
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
        // catch (error) {
        //     console.error("Error While Updating Password:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Failed Upadting Password, please try again",
        //     });
        // }
    }
);
