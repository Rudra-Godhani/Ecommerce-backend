import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { addProductToCart, decreaseQuantity, getCart, removeProductFromCart } from "../controller/tempCart";

const router = express.Router();

router.post("/addproducttocart",isAuthenticated, addProductToCart);
router.post("/removeproductfromcart",isAuthenticated, removeProductFromCart);
router.post("/decreasequantity",isAuthenticated, decreaseQuantity);
router.get("/getcart",isAuthenticated, getCart);

export default router;
