import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { addProductToWishList, getWishList, removeProductFromWishList } from "../controller/tempWishlist";

const router = express.Router();

router.post("/addproducttowishlist", isAuthenticated, addProductToWishList);
router.post(
    "/removeproductfromwishlist",
    isAuthenticated,
    removeProductFromWishList
);
router.get("/getwishlist", isAuthenticated, getWishList);

export default router;
