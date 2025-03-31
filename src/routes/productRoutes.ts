import express from "express";
import {
    filteredProducts,
    getAllBrands,
    getAllCategories,
    getAllProducts,
    getProduct,
    searchedProducts,
} from "../controller/ProductController";

const router = express.Router();

router.get("/getallproducts", getAllProducts);
router.get("/filteredproducts", filteredProducts);
router.get("/searchedproducts", searchedProducts);
router.get("/getproduct/:productid", getProduct);
router.get("/getallcategories", getAllCategories);
router.get("/getallbrands", getAllBrands);

export default router;
