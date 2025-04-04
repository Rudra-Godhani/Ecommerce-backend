import { AppDataSource } from "../config/databaseConnection";
import { Brand, Category, Product } from "../models/Product";
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { Cart, CartItem } from "../models/Cart";
import { User } from "../models/User";
import { Brackets, ILike } from "typeorm";

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

export const getProduct = catchAsyncErrorHandler(
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

// export const filteredProducts = catchAsyncErrorHandler(
//     async (req: Request, res: Response, nest: NextFunction) => {
//         const { category, brand, minprice, maxprice, sortby } = req.query;

//         let filteredProducts = await productRepository.find();

//         console.log("category:", category);
//         console.log("brand:", brand);
//         console.log("minprice:", minprice);
//         console.log("maxprice:", maxprice);
//         console.log("sortby:", sortby);

//         if (category) {
//             filteredProducts = filteredProducts.filter(
//                 (product: Product) =>
//                     product.category.name.toLowerCase() ===
//                     (category as string).toLowerCase()
//             );
//         }
//         if (brand) {
//             const brandArray = (brand as string)
//                 .split(",")
//                 .map((b) => b.trim());

//             filteredProducts = filteredProducts.filter((product: Product) =>
//                 brandArray
//                     .map((b) => b.toLowerCase())
//                     .includes(product.brand.name.toLowerCase())
//             );
//         }
//         if (minprice) {
//             filteredProducts = filteredProducts.filter(
//                 (product) => product.retailPrice >= Number(minprice)
//             );
//         }

//         if (maxprice) {
//             filteredProducts = filteredProducts.filter(
//                 (product) => product.retailPrice <= Number(maxprice)
//             );
//         }

//         if (sortby) {
//             if (sortby === "popularity_low_to_high") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => a.rating - b.rating
//                 );
//             } else if (sortby === "popularity_high_to_low") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => b.rating - a.rating
//                 );
//             } else if (sortby === "price_low_to_high") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => a.retailPrice - b.retailPrice
//                 );
//             } else if (sortby === "price_high_to_low") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => b.retailPrice - a.retailPrice
//                 );
//             }
//         }

//         res.status(200).json({
//             status: true,
//             filteredProducts,
//             length: filteredProducts.length,
//         });
//     }
// );
// export const searchedProducts = catchAsyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const { search } = req.query;

//         if (!search) {
//             next(
//                 new ErrorHandler("Please provide a valid search keyword", 400)
//             );
//             return;
//         }

//         const keyword = `%${(search as string).toLowerCase()}%`;

//         const searchedProducts = await productRepository
//             .createQueryBuilder("product")
//             .where(
//                 `
//                 product.title ILIKE :keyword OR
//                 product.brand ILIKE :keyword OR
//                 product.category ILIKE :keyword OR
//                 product.descriptionSmall ILIKE :keyword
//                 `,
//                 { keyword }
//             )
//             .getMany();

//         res.status(200).json({
//             status: true,
//             searchedProducts,
//             length: searchedProducts.length,
//         });
//     }
// );

// export const filteredProducts = catchAsyncErrorHandler(
//     async (req: Request, res: Response, nest: NextFunction) => {
//         const { category, brand, minprice, maxprice, sortby, search } =
//             req.query;

//         console.log("category:", category);
//         console.log("brand:", brand);
//         console.log("minprice:", minprice);
//         console.log("maxprice:", maxprice);
//         console.log("sortby:", sortby);
//         console.log("search:", search);

//         let filteredProducts: Product[];

//         console.log("1");
//         if (search) {
//             console.log("2");
//             const keyword = `%${(search as string).toLowerCase()}%`;

//             filteredProducts = await productRepository
//                 .createQueryBuilder("product")
//                 .leftJoinAndSelect("product.category", "category")
//                 .leftJoinAndSelect("product.brand", "brand")
//                 .where(
//                     `
//                     product.title ILIKE :keyword OR
//                 brand.name ILIKE :keyword OR
//                 category.name ILIKE :keyword OR
//                 product.descriptionSmall ILIKE :keyword
//                 `,
//                     { keyword }
//                 )
//                 .getMany();
//         } else {
//             console.log("3");
//             filteredProducts = await productRepository.find();
//         }

//         if (category) {
//             filteredProducts = filteredProducts.filter(
//                 (product: Product) =>
//                     product.category.name.toLowerCase() ===
//                     (category as string).toLowerCase()
//             );
//         }
//         if (brand) {
//             const brandArray = (brand as string)
//                 .split(",")
//                 .map((b) => b.trim());

//             filteredProducts = filteredProducts.filter((product: Product) =>
//                 brandArray
//                     .map((b) => b.toLowerCase())
//                     .includes(product.brand.name.toLowerCase())
//             );
//         }
//         if (minprice) {
//             filteredProducts = filteredProducts.filter(
//                 (product) => product.retailPrice >= Number(minprice)
//             );
//         }

//         if (maxprice) {
//             filteredProducts = filteredProducts.filter(
//                 (product) => product.retailPrice <= Number(maxprice)
//             );
//         }

//         if (sortby) {
//             if (sortby === "popularity_low_to_high") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => a.rating - b.rating
//                 );
//             } else if (sortby === "popularity_high_to_low") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => b.rating - a.rating
//                 );
//             } else if (sortby === "price_low_to_high") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => a.retailPrice - b.retailPrice
//                 );
//             } else if (sortby === "price_high_to_low") {
//                 filteredProducts = filteredProducts.sort(
//                     (a, b) => b.retailPrice - a.retailPrice
//                 );
//             }
//         }

//         res.status(200).json({
//             status: true,
//             filteredProducts,
//             length: filteredProducts.length,
//         });
//     }
// );

// export const filteredProducts = catchAsyncErrorHandler(
//     async (req: Request, res: Response, nest: NextFunction) => {
//         const { category, brand, minprice, maxprice, sortby, search } =
//             req.query;

//         console.log("category:", category);
//         console.log("brand:", brand);
//         console.log("minprice:", minprice);
//         console.log("maxprice:", maxprice);
//         console.log("sortby:", sortby);
//         console.log("search:", search);

//         let query = productRepository
//             .createQueryBuilder("product")
//             .leftJoinAndSelect("product.category", "category")
//             .leftJoinAndSelect("product.brand", "brand");

//         if (search) {
//             const keyword = `%${(search as string).toLowerCase()}%`;
//             query = query.andWhere(
//                 `product.title ILIKE :keyword OR
//                 brand.name ILIKE :keyword OR
//                 category.name ILIKE :keyword OR
//                 product.descriptionSmall ILIKE :keyword`,
//                 { keyword }
//             );
//         }

//         if (category) {
//             query = query.andWhere("LOWER(category.name) = LOWER(:category)", {
//                 category,
//             });
//         }

//         if (brand) {
//             const brandArray = (brand as string)
//                 .split(",")
//                 .map((b) => b.trim().toLowerCase());
//             query = query.andWhere("LOWER(brand.name) IN (:...brandArray)", {
//                 brandArray,
//             });
//         }

//         if (minprice) {
//             query = query.andWhere("product.retailPrice >= :minprice", {
//                 minprice: Number(minprice),
//             });
//         }
//         if (maxprice) {
//             query = query.andWhere("product.retailPrice <= :maxprice", {
//                 maxprice: Number(maxprice),
//             });
//         }

//         if (sortby) {
//             if (sortby === "popularity_low_to_high") {
//                 query = query.orderBy("product.rating", "ASC");
//             } else if (sortby === "popularity_high_to_low") {
//                 query = query.orderBy("product.rating", "DESC");
//             } else if (sortby === "price_low_to_high") {
//                 query = query.orderBy("product.retailPrice", "ASC");
//             } else if (sortby === "price_high_to_low") {
//                 query = query.orderBy("product.retailPrice", "DESC");
//             }
//         }

//         const filteredProducts = await query.getMany();

//         res.status(200).json({
//             status: true,
//             filteredProducts,
//             length: filteredProducts.length,
//         });
//     }
// );

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

        const searchedProducts = await productRepository.find({
            where: [
                { title: ILike(`%${keyword}%`) },
                { brand: { name: ILike(`%${keyword}%`) } },
                { category: { name: ILike(`%${keyword}%`) } },
                { descriptionSmall: ILike(`%${keyword}%`) },
            ],
            relations: ["category", "brand"],
        });

        res.status(200).json({
            status: true,
            searchedProducts,
            length: searchedProducts.length,
        });
    }
);
