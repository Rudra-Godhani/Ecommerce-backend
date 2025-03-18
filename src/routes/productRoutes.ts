import express from "express";
import { getAllProducts } from "../controller/ProductController";

const router = express.Router();

router.get("/getAllProducts",getAllProducts);

export default router;