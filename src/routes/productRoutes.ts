import express from "express";
import { addProductToCart, filteredProducts, getAllProducts, getCart, searchedProducts } from "../controller/ProductController";

const router = express.Router();

router.get("/getallproducts",getAllProducts);
router.get("/filteredproducts",filteredProducts);
router.get("/searchedproducts",searchedProducts);
router.post("/addproducttocart",addProductToCart);
router.get("/getcart", getCart);

export default router;