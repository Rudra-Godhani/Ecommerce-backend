import { AppDataSource } from "../config/data-source";
import { Product } from "../models/Product";
import { Request, Response } from "express";

const productRepository = AppDataSource.getRepository(Product);

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productRepository.find();
        res.status(200).json({ succcess: true, products: products });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed fetching products.",
        });
    }
};
