import { AppDataSource } from "../config/databaseConnection";
import { Product } from "../models/Product";
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";

const productRepository = AppDataSource.getRepository(Product);

export const getAllProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await productRepository.find();
        res.status(200).json({ succcess: true, products: products });
        // catch (error) {
        //     res.status(500).json({
        //         success: false,
        //         message: "Failed fetching products.",
        //     });
        // }
    }
);

export const filteredProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, nest: NextFunction) => {
        const { category, brand, minPrice, maxPrice, sortby } = req.query;

        let filteredProducts = await productRepository.find();

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
                filteredProducts = filteredProducts.sort(
                    (a, b) => a.rating - b.rating
                );
            } else if (sortby === "popularity_high_to_low") {
                filteredProducts = filteredProducts.sort(
                    (a, b) => b.rating - a.rating
                );
            } else if (sortby === "price_low_to_high") {
                filteredProducts = filteredProducts.sort(
                    (a, b) => a.retailPrice - b.retailPrice
                );
            } else if (sortby === "price_high_to_low") {
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
        // catch (error) {
        //     console.error("Error filtering products:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Products cannot be filtered",
        //     });
        // }
    }
);

export const sortedProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { sortby } = req.query;
        console.log(req.query);

        let sortedProducts = await productRepository.find();
        console.log(sortby);

        if (sortby) {
            if (sortby === "popularity_low_to_high") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => a.rating - b.rating
                );
            } else if (sortby === "popularity_high_to_low") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => b.rating - a.rating
                );
            } else if (sortby === "price_low_to_high") {
                sortedProducts = sortedProducts.sort(
                    (a, b) => a.retailPrice - b.retailPrice
                );
            } else if (sortby === "price_high_to_low") {
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
        // catch (error) {
        //     console.error("Error sorting products:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Products cannot be sorted",
        //     });
        // }
    }
);

export const searchProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { searchKeyword } = req.query;
        console.log("searchKeyword:",searchKeyword);

        


        res.status(200).json({
            status: true,
            sortedProducts,
            length: filteredProducts.length,
        });
        //  catch (error) {
        //     console.error("Error sorting products:", error);
        //     res.status(500).json({
        //         success: false,
        //         message: "Products cannot be sorted",
        //     });
        // }
    }
);
