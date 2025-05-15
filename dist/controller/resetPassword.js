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
const databaseConnection_1 = require("../config/databaseConnection");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const nodemailer_1 = __importDefault(require("nodemailer"));
const catchAsyncErrorHandler_1 = require("../utils/catchAsyncErrorHandler");
const errorHandler_1 = require("../middleware/errorHandler");
const class_validator_1 = require("class-validator");
const userRepository = databaseConnection_1.AppDataSource.getRepository(User_1.User);
exports.forgotPassword = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const userToValidate = userRepository.create({
        email,
    });
    const validationErrors = yield (0, class_validator_1.validate)(userToValidate, {
        skipMissingProperties: true,
    });
    if (validationErrors.length > 0) {
        next(new errorHandler_1.ErrorHandler(Object.values(validationErrors[0].constraints)[0], 400));
        return;
    }
    const user = yield userRepository.findOne({
        where: { email },
    });
    if (!user) {
        next(new errorHandler_1.ErrorHandler("No user found with this email address.", 404));
        return;
    }
    const payload = {
        id: user.id,
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        next(new errorHandler_1.ErrorHandler("Internal server error: JWT_SECRET is not defined in environment variables.", 500));
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
    transport.sendMail(mailOptions, function (error) {
        if (error) {
            next(new errorHandler_1.ErrorHandler("Failed to send reset email. Please try again later.", 500));
            return;
        }
        else {
            res.status(200).json({
                success: true,
                message: "Password reset link sent successfully. Please check your email.",
            });
        }
    });
}));
exports.resetPassword = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
    const userToValidate = userRepository.create({
        password: newPassword,
    });
    const validationErrors = yield (0, class_validator_1.validate)(userToValidate, {
        skipMissingProperties: true,
    });
    if (validationErrors.length > 0) {
        next(new errorHandler_1.ErrorHandler(Object.values(validationErrors[0].constraints)[0], 400));
        return;
    }
    if (newPassword !== confirmPassword) {
        next(new errorHandler_1.ErrorHandler("NewPassword and ConfirmNewPassword don't match.", 400));
        return;
    }
    if (!token) {
        next(new errorHandler_1.ErrorHandler("token is missing.", 404));
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        next(new errorHandler_1.ErrorHandler("Internal server error: JWT_SECRET is not defined in environment variables.", 500));
        return;
    }
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    if (!decoded) {
        next(new errorHandler_1.ErrorHandler("token is not valid.", 401));
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
}));
