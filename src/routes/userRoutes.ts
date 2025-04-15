import express from "express";
import {
    getUser,
    getAllUsers,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
} from "../controller/userController";
import { isAuthenticated } from "../middleware/auth";
import { forgotPassword, resetPassword } from "../controller/resetPassword";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getalluser", getAllUsers);
router.get("/getuser", isAuthenticated, getUser);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
