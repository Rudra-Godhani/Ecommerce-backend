import express from "express";
import {
    addProductToWishList,
    getWishList,
    removeProductFromWishList,
} from "../controller/WishListController";
import { removeProductFromCart } from "../controller/CartController";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/addproducttowishlist", isAuthenticated, addProductToWishList);
router.post(
    "/removeproductfromwishlist",
    isAuthenticated,
    removeProductFromWishList
);
router.get("/getwishlist", isAuthenticated, getWishList);

export default router;
