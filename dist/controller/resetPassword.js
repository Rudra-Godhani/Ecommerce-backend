"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = void 0;
const data_source_1 = require("../config/data-source");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("../models/User");
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
// register user
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Check if username exists
        const user = yield userRepository.findOne({
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
                message: "Internal server error: JWT_SECRET is not defined in environment variables",
            });
            return;
        }
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: "5m",
        });
        let transport = nodemailer_1.default.createTransport({
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
                    message: "Failed to send reset email. Please try again later.",
                });
                return;
            }
            else {
                res.status(200).json({
                    success: true,
                    message: "Password reset link sent successfully. Please check your email.",
                });
            }
        });
    }
    catch (error) {
        console.error("Error during forgot password process:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while processing your request. Please try again later.",
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                message: "Internal server error: JWT_SECRET is not defined in environment variables",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded) {
            res.status(401).json({
                success: false,
                message: "token is not valid",
            });
            return;
        }
        const id = decoded.id;
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield userRepository.update(id, {
            password: hashedPassword,
        });
        res.status(200).json({
            success: true,
            message: "Password updated successfullly",
        });
    }
    catch (error) {
        console.error("Error during reset password process:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while updatig password. Please try again later.",
        });
    }
});
exports.resetPassword = resetPassword;
