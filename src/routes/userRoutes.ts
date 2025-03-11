import express from "express";
import { getUser, getAllUsers, login, logout, register, updateProfile, updatePassword } from "../controller/userController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout",isAuthenticated, logout);
router.get("/getalluser", getAllUsers);
router.get("/getuser",isAuthenticated, getUser);
router.put("/update/profile",isAuthenticated, updateProfile);
router.put("/update/password",isAuthenticated, updatePassword);

export default router;