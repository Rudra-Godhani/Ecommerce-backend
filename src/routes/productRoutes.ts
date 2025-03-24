import express from "express";
import { filteredProducts, getAllProducts, searchedProducts } from "../controller/ProductController";

const router = express.Router();

router.get("/getallproducts",getAllProducts);
router.get("/filteredproducts",filteredProducts);
router.get("/searchedproducts",searchedProducts);

export default router;