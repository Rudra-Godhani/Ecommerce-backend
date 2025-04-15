import express from "express";
import { filteredProducts, getAllBrands, getAllCategories, getAllProducts, getProductById } from "../controller/tempProduct";

const router = express.Router();

router.get("/getallproducts", getAllProducts);
router.get("/filteredproducts", filteredProducts);
router.get("/getproduct/:productid", getProductById);
router.get("/getallcategories", getAllCategories);
router.get("/getallbrands", getAllBrands);

export default router;
