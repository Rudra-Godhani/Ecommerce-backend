import { AppDataSource } from "../config/databaseConnection";
import { Brand, Category, Product } from "../models/Product";
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { Brackets } from "typeorm";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const brandRepository = AppDataSource.getRepository(Brand);

export const getAllProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await productRepository.find({
            relations: ["category", "brand"],
        });

        res.status(200).json({ success: true, products: products });
    }
);

export const getProductById = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { productid } = req.params;

        if (!productid) {
            next(new ErrorHandler("Product ID is required", 400));
            return;
        }

        const product = await productRepository.findOne({
            where: { id: productid as string },
            relations: ["category", "brand"],
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
        const categories = await categoryRepository.find({
            relations: ["brands"],
        });

        res.status(200).json({ success: true, categories: categories });
    }
);

export const getAllBrands = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const brands = await brandRepository.find({
            relations: ["categories"],
        });

        res.status(200).json({ success: true, brands: brands });
    }
);

export const filteredProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response) => {
        const {
            category,
            brand,
            minprice,
            maxprice,
            sortby,
            search,
            page = 1,
            limit = 9,
        } = req.query;
        const pageNumber = Number(page);
        const pageSize = Number(limit);
        const skip = (pageNumber - 1) * pageSize;

        let query = productRepository
            .createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category")
            .leftJoinAndSelect("product.brand", "brand");

        if (search) {
            const keyword = `%${(search as string).toLowerCase()}%`;
            query = query.andWhere(
                new Brackets((qb) => {
                    qb.where("product.title ILIKE :keyword", { keyword })
                        .orWhere("brand.name ILIKE :keyword", { keyword })
                        .orWhere("category.name ILIKE :keyword", { keyword })
                        .orWhere("product.descriptionSmall ILIKE :keyword", {
                            keyword,
                        });
                })
            );
        }

        if (category) {
            query = query.andWhere("LOWER(category.name) = LOWER(:category)", {
                category,
            });
        }

        if (brand) {
            const brandArray = (brand as string)
                .split(",")
                .map((b) => b.trim().toLowerCase());
            query = query.andWhere("LOWER(brand.name) IN (:...brandArray)", {
                brandArray,
            });
        }

        if (minprice) {
            query = query.andWhere("product.retailPrice >= :minprice", {
                minprice: Number(minprice),
            });
        }

        if (maxprice) {
            query = query.andWhere("product.retailPrice <= :maxprice", {
                maxprice: Number(maxprice),
            });
        }

        if (sortby) {
            if (sortby === "price_low_to_high")
                query = query.orderBy("product.retailPrice", "ASC");
            if (sortby === "price_high_to_low")
                query = query.orderBy("product.retailPrice", "DESC");
            if (sortby === "popularity_high_to_low")
                query = query.orderBy("product.rating", "DESC");
            if (sortby === "popularity_low_to_high")
                query = query.orderBy("product.rating", "ASC");
        }

        const totalCount = await query.getCount();
        const totalPages = Math.ceil(totalCount / pageSize);

        const filteredProducts = await query
            .skip(skip)
            .take(pageSize)
            .getMany();

        res.status(200).json({
            status: true,
            filteredProducts,
            totalPages,
            currentPage: pageNumber,
            totalCount,
        });
    }
);

// hello
