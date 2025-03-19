import express from "express";
import { filteredProducts, getAllProducts, sortedProducts } from "../controller/ProductController";

const router = express.Router();

router.get("/getallproducts",getAllProducts);
router.get("/filteredproducts",filteredProducts);
router.get("/sortedproducts",sortedProducts);

export default router;