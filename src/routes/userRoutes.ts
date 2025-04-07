import express from "express";
import {
    getUser,
    getAllUsers,
    login,
    logout,
    register,
    updateProfile,
    updatePassword,
    addNewAddress,
    updateAddress,
    getUserAddresses,
    deleteAddress,
} from "../controller/userController";
import { isAuthenticated } from "../middleware/auth";
import { forgotPassword, resetPassword } from "../controller/resetPassword";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/getalluser", getAllUsers);
router.get("/getuser", isAuthenticated, getUser);
router.post("/addnewaddress", isAuthenticated, addNewAddress);
router.put("/update/address/:addressId", isAuthenticated, updateAddress);
router.get("/getuseraddresses", isAuthenticated, getUserAddresses);
router.delete("/delete/address/:addressId", isAuthenticated, deleteAddress);
router.put("/update/profile", isAuthenticated, updateProfile);
router.put("/update/password", isAuthenticated, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
