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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.updateProfile = exports.getUser = exports.getAllUsers = exports.logout = exports.login = exports.register = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cloudinary_1 = require("cloudinary");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const class_validator_1 = require("class-validator");
const catchAsyncErrorHandler_1 = require("../utils/catchAsyncErrorHandler");
const userRepository = databaseConnection_1.AppDataSource.getRepository(User_1.User);
exports.register = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    const newUser = userRepository.create({
        name,
        email,
        password,
    });
    const validationErrors = yield (0, class_validator_1.validate)(newUser, {
        skipMissingProperties: true,
    });
    if (validationErrors.length > 0) {
        next(new errorHandler_1.ErrorHandler(Object.values(validationErrors[0].constraints)[0], 400));
        return;
    }
    const emailExists = yield userRepository.findOne({ where: { email } });
    if (emailExists) {
        next(new errorHandler_1.ErrorHandler("Email is already used", 400));
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    newUser.password = hashedPassword;
    yield userRepository.save(newUser);
    const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
    res.status(201).json({
        success: true,
        message: "User Registered Successfully",
        user: userWithoutPassword,
    });
}));
exports.login = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userToValidate = userRepository.create({
        email,
        password,
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
        next(new errorHandler_1.ErrorHandler("User is not registered,Please signup first", 400));
        return;
    }
    const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
    if (isValidPassword) {
        const payload = {
            id: user.id,
        };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            next(new errorHandler_1.ErrorHandler("JWT_SECRET is not found.", 400));
            return;
        }
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: "7d",
        });
        user.token = token;
        yield userRepository.save(user);
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
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
    }
    else {
        next(new errorHandler_1.ErrorHandler("Password is incorrect", 400));
        return;
    }
}));
exports.logout = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "User Logged out successfully",
    });
}));
exports.getAllUsers = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userRepository.find();
    res.status(200).json({
        success: true,
        users: users,
    });
}));
exports.getUser = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
}));
exports.updateProfile = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phoneNumber } = req.body;
    let userNewData = userRepository.create({
        name: name,
        email: email,
        profileImage: req.user.profileImage,
    });
    if (phoneNumber) {
        userNewData.phoneNumber = phoneNumber;
    }
    const validationErrors = yield (0, class_validator_1.validate)(userNewData, {
        skipMissingProperties: true,
    });
    if (validationErrors.length > 0) {
        next(new errorHandler_1.ErrorHandler(Object.values(validationErrors[0].constraints)[0], 400));
        return;
    }
    const users = yield userRepository.find();
    const filteredUser = users.filter((user) => user.id !== req.user.id);
    const emailExist = filteredUser.find((user) => user.email === req.body.email);
    if (emailExist) {
        next(new errorHandler_1.ErrorHandler("Email is already used", 400));
        return;
    }
    if (req.files && req.files.profileImage) {
        const profileImage = req.files.profileImage;
        if (profileImage) {
            const currentProfileImageId = req.user.profileImage
                .public_id;
            if (currentProfileImageId) {
                yield cloudinary_1.v2.uploader.destroy(currentProfileImageId);
            }
            const tempFilePath = profileImage
                .tempFilePath;
            const newProfileImage = yield cloudinary_1.v2.uploader.upload(tempFilePath, {
                folder: "User_Profile_Image",
            });
            userNewData.profileImage = {
                public_id: newProfileImage.public_id,
                url: newProfileImage.secure_url,
            };
        }
    }
    yield userRepository.update(req.user.id, userNewData);
    const updatedUser = yield userRepository.findOne({
        where: { id: req.user.id },
    });
    res.status(200).json({
        success: true,
        user: updatedUser,
        message: "Profile updated successfully",
    });
}));
exports.updatePassword = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword) {
        next(new errorHandler_1.ErrorHandler("Current password is required.", 400));
        return;
    }
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
    const user = yield userRepository.findOne({
        where: { id: req.user.id },
    });
    if (!user) {
        next(new errorHandler_1.ErrorHandler("User not found", 404));
        return;
    }
    const isPasswordMatched = yield bcrypt_1.default.compare(req.body.currentPassword, user.password);
    if (!isPasswordMatched) {
        next(new errorHandler_1.ErrorHandler("Current password is incorrect", 400));
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(req.body.newPassword, 10);
    user.password = hashedPassword;
    yield userRepository.save(user);
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
    });
}));
