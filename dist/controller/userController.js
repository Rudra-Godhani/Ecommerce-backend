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
const data_source_1 = require("../config/data-source");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
const User_1 = require("../models/User");
dotenv_1.default.config();
const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
// register user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if username exists
        const usernameExists = yield userRepository.findOne({
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
        const emailExists = yield userRepository.findOne({ where: { email } });
        if (emailExists) {
            res.status(400).json({
                success: false,
                message: "Email is already used",
            });
            return;
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = userRepository.create({
            name,
            email,
            password: hashedPassword,
        });
        yield userRepository.save(newUser);
        const { password: _ } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again",
        });
    }
});
exports.register = register;
// login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = yield userRepository.findOne({
            where: { email },
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: "User is not registered,Please signup first",
            });
            return;
        }
        const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
        if (isValidPassword) {
            const payload = {
                id: user.id,
            };
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                res.status(400).json({
                    success: false,
                    message: "JWT_SECRET is not defined in environment variables",
                });
                return;
            }
            const token = jsonwebtoken_1.default.sign(payload, secret, {
                expiresIn: "7d",
            });
            user.token = token;
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            const options = {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user: userWithoutPassword,
                message: "User Logged in successfully",
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "Password is incorrect",
            });
        }
    }
    catch (error) {
        console.error("Error LoggedIn user:", error);
        res.status(500).json({
            success: false,
            message: "Login Failure, please try again",
        });
    }
});
exports.login = login;
// logout
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "User Logged out successfully",
    });
});
exports.logout = logout;
// get all users
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userRepository.find();
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed fetching users",
        });
    }
});
exports.getAllUsers = getAllUsers;
// get user
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});
exports.getUser = getUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userRepository.find();
        console.log("users:", users);
        const filteredUser = users.filter((user) => user.id !== req.user.id);
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
            profileImage: req.user.profileImage,
        };
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
        console.log("userNeWData:", userNewData);
        yield userRepository.update(req.user.id, userNewData);
        const updatedUser = yield userRepository.findOne({
            where: { id: req.user.id },
        });
        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        console.error("Error While Updating Profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed Upadting Profile, please try again",
        });
    }
});
exports.updateProfile = updateProfile;
// update Password
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userRepository.findOne({
            where: { id: req.user.id },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const isPasswordMatched = yield bcrypt_1.default.compare(req.body.currentPassword, user.password);
        if (!isPasswordMatched) {
            res.status(400).json({
                success: false,
                message: "Old password is incorrect",
            });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(req.body.newPassword, 10);
        user.password = hashedPassword;
        yield userRepository.save(user);
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    }
    catch (error) {
        console.error("Error While Updating Password:", error);
        res.status(500).json({
            success: false,
            message: "Failed Upadting Password, please try again",
        });
    }
});
exports.updatePassword = updatePassword;
