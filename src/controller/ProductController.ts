import { AppDataSource } from "../config/databaseConnection";
import { Brand, Category, Product } from "../models/Product";
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { Cart, CartItem } from "../models/Cart";
import { User } from "../models/User";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const brandRepository = AppDataSource.getRepository(Brand);

export const getAllProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await productRepository.find();

        res.status(200).json({ success: true, products: products });
    }
);

export const getProduct = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { productid } = req.params;

        if (!productid) {
            next(new ErrorHandler("Product ID is required", 400));
            return;
        }

        const product = await productRepository.findOne({
            where: { id: productid as string },
        });

        if (!product) {
            next(new ErrorHandler("Product does not exist", 404));
            return;
        }

        res.status(200).json({ success: true, product: product });
    }
);
export const getAllCategories = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const categories = await categoryRepository.find();

        res.status(200).json({ success: true, categories: categories });
    }
);

export const getAllBrands = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const brands = await brandRepository.find();

        res.status(200).json({ success: true, brands: brands });
    }
);

export const filteredProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, nest: NextFunction) => {
        const { category, brand, minprice, maxprice, sortby } = req.query;

        let filteredProducts = await productRepository.find();

        console.log("category:", category);
        console.log("brand:", brand);
        console.log("minprice:", minprice);
        console.log("maxprice:", maxprice);
        console.log("sortby:", sortby);

        if (category) {
            filteredProducts = filteredProducts.filter(
                (product: Product) =>
                    product.category.name.toLowerCase() ===
                    (category as string).toLowerCase()
            );
        }
        if (brand) {
            const brandArray = (brand as string)
                .split(",")
                .map((b) => b.trim());

            filteredProducts = filteredProducts.filter((product: Product) =>
                brandArray
                    .map((b) => b.toLowerCase())
                    .includes(product.brand.name.toLowerCase())
            );
        }
        if (minprice) {
            filteredProducts = filteredProducts.filter(
                (product) => product.retailPrice >= Number(minprice)
            );
        }

        if (maxprice) {
            filteredProducts = filteredProducts.filter(
                (product) => product.retailPrice <= Number(maxprice)
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
    }
);
export const searchedProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { search } = req.query;

        if (!search) {
            next(
                new ErrorHandler("Please provide a valid search keyword", 400)
            );
            return;
        }

        const keyword = `%${(search as string).toLowerCase()}%`;

        const searchedProducts = await productRepository
            .createQueryBuilder("product")
            .where(
                `
                product.title ILIKE :keyword OR
                product.brand ILIKE :keyword OR
                product.category ILIKE :keyword OR
                product.descriptionSmall ILIKE :keyword
                `,
                { keyword }
            )
            .getMany();

        res.status(200).json({
            status: true,
            searchedProducts,
            length: searchedProducts.length,
        });
    }
);
