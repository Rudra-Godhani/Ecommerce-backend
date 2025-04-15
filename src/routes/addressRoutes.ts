import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
    addNewAddress,
    deleteAddress,
    getUserAddresses,
    setAddressAsDefault,
    updateAddress,
} from "../controller/addressController";

const router = express.Router();

router.post("/addnewaddress", isAuthenticated, addNewAddress);
router.put("/update/:addressId", isAuthenticated, updateAddress);
router.put(
    "/update/setdefault/:addressId",
    isAuthenticated,
    setAddressAsDefault
);
router.get("/getuseraddresses", isAuthenticated, getUserAddresses);
router.delete("/delete/:addressId", isAuthenticated, deleteAddress);

export default router;
