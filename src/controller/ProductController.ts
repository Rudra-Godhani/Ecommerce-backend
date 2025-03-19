import { AppDataSource } from "../config/databaseConnection";
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

export const filteredProducts = async (req: Request, res: Response) => {
    try {
        const { category, brand, minPrice, maxPrice, sortby } = req.query;

        let filteredProducts = await productRepository.find();

        console.log(category);

        if (category) {
            filteredProducts = filteredProducts.filter(
                (product: Product) =>
                    product.category.toLowerCase() ===
                    (category as string).toLowerCase()
            );
        }
        if (brand) {
            filteredProducts = filteredProducts.filter(
                (product: Product) =>
                    product.brand.toLowerCase() ===
                    (brand as string).toLowerCase()
            );
        }
        if (minPrice) {
            filteredProducts = filteredProducts.filter(
                (product) => product.retailPrice >= Number(minPrice)
            );
        }

        if (maxPrice) {
            filteredProducts = filteredProducts.filter(
                (product) => product.retailPrice <= Number(maxPrice)
            );
        }

        if (sortby) {
            if (sortby === "popularity_low_to_high") {
                console.log("sortby1:")
                filteredProducts = filteredProducts.sort(
                    (a, b) => a.rating - b.rating
                );
            } else if (sortby === "popularity_high_to_low") {
                console.log("sortby2:")
                filteredProducts = filteredProducts.sort(
                    (a, b) => b.rating - a.rating
                );
            } else if (sortby === "price_low_to_high") {
                console.log("sortby3:")
                filteredProducts = filteredProducts.sort(
                    (a, b) => a.retailPrice - b.retailPrice
                );
            } else if (sortby === "price_high_to_low") {
                console.log("sortby4:")
                filteredProducts = filteredProducts.sort(
                    (a, b) => b.retailPrice - a.retailPrice
                );
            }
        }

        res.status(200).json({
            status: true,
            filteredProducts,
            length: filteredProducts.length,
        });
    } catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({
            success: false,
            message: "Products cannot be filtered",
        });
    }
};

export const sortedProducts = async (req: Request, res: Response) => {
    try {
        const { queryText } = req.query;

        let sortedProducts = await productRepository.find();

        if (queryText) {
            if (queryText === "popularity: low_to_high") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => a.rating - b.rating
                );
            } else if (queryText === "popularity: high_to_low") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => a.rating - b.rating
                );
            } else if (queryText === "price: low_to_high") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => a.retailPrice - b.retailPrice
                );
            } else if (queryText === "price: high_to_low") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => b.retailPrice - a.retailPrice
                );
            }
        }

        res.status(200).json({
            status: true,
            sortedProducts,
            length: filteredProducts.length,
        });
    } catch (error) {
        console.error("Error filtering products:", error);
        res.status(500).json({
            success: false,
            message: "Products cannot be filtered",
        });
    }
};
