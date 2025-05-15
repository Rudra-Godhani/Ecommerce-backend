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
exports.isAuthenticated = void 0;
const databaseConnection_1 = require("../config/databaseConnection");
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const catchAsyncErrorHandler_1 = require("../utils/catchAsyncErrorHandler");
const errorHandler_1 = require("./errorHandler");
dotenv_1.default.config();
const userRepository = databaseConnection_1.AppDataSource.getRepository(User_1.User);
exports.isAuthenticated = (0, catchAsyncErrorHandler_1.catchAsyncErrorHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.cookies;
    if (!token) {
        next(new errorHandler_1.ErrorHandler("User is not authenticated.", 401));
        return;
    }
    if (!process.env.JWT_SECRET) {
        next(new errorHandler_1.ErrorHandler("JWT_SECRET is not found.", 404));
        return;
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        next(new errorHandler_1.ErrorHandler("token is invalid.", 401));
        return;
    }
    const user = yield userRepository.findOne({
        where: { id: decoded.id },
    });
    if (!user) {
        next(new errorHandler_1.ErrorHandler("User not found.", 404));
        return;
    }
    req.user = user;
    next();
}));
