import express from "express";
import {
    filteredProducts,
    getAllBrands,
    getAllCategories,
    getAllProducts,
    getProduct,
    getProductById,
    searchedProducts,
} from "../controller/ProductController";

const router = express.Router();

router.get("/getallproducts", getAllProducts);
router.get("/filteredproducts", filteredProducts);
router.get("/searchedproducts", searchedProducts);
router.get("/getproduct/:productid", getProduct);
router.get("/getproductindex/:productID", getProductById);
router.get("/getallcategories", getAllCategories);
router.get("/getallbrands", getAllBrands);

export default router;
