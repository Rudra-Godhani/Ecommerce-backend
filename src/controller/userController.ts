import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);

// register user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if username exists
        const usernameExists = await userRepository.findOne({
            where: { name },
        });
        if (usernameExists) {
            res.status(400).json({
                success: false,
                message: "Username is already used",
            });
            return;
        }

        // Check if email exists
        const emailExists = await userRepository.findOne({ where: { email } });
        if (emailExists) {
            res.status(400).json({
                success: false,
                message: "Email is already used",
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email,
            password: hashedPassword,
        });
        await userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again",
        });
    }
};

// login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await userRepository.findOne({
            where: { email },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User is not registered,Please signup first",
            });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            const payload = {
                id: user.id,
            };

            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(400).json({
                    success: false,
                    message:
                        "JWT_SECRET is not defined in environment variables",
                });
                return;
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: "2h",
            });

            user.token = token;
            const { password: _, ...userWithoutPassword } = user;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user: userWithoutPassword,
                message: "User Logged in successfully",
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Password is incorrect",
            });
        }
    } catch (error) {
        console.error("Error LoggedIn user:", error);
        res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
};

// logout
export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "User Logged out successfully",
    });
};

// get all users
export const getAllUsers = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const users = await userRepository.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed fetching users",
        });
    }
};

interface AuthenticatedRequest extends Request {
    user?: User;
}

// get user
export const getUser = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
};

// update profile

interface AuthAndFileRequest extends Request {
    user?: User;
    files?: { [key: string]: UploadedFile | UploadedFile[] } | null;
}
export const updateProfile = async (
    req: AuthAndFileRequest,
    res: Response
): Promise<void> => {
    try {
        const users = await userRepository.find();
        console.log("users:", users);

        const filteredUser = users.filter(
            (user) => user.id !== (req.user as User).id
        );

        console.log("filteredUser:", filteredUser);

        const emailExist = filteredUser.find((user) => user.email === req.body.email);
        console.log("emailExist:", emailExist);
        if (emailExist) {
            res.status(400).json({
                success: false,
                message: "Email is already used",
            });
            return;
        }

        const userNewData = {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            profileImage: (req.user as User).profileImage,
        };

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

        console.log("userNeWData:", userNewData);

        await userRepository.update((req.user as User).id, userNewData);

        const updatedUser = await userRepository.findOne({
            where: { id: (req.user as User).id },
        });

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Error While Updating Profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed Upadting Profile, please try again",
        });
    }
};

// update Password
export const updatePassword = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        const user = await userRepository.findOne({
            where: { id: (req.user as User).id },
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        const isPasswordMatched = await bcrypt.compare(
            req.body.oldPassword,
            user.password
        );

        if (!isPasswordMatched) {
            res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        await userRepository.save(user);
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("Error While Updating Password:", error);
        res.status(500).json({
            success: false,
            message: "Failed Upadting Password, please try again",
        });
    }
};
