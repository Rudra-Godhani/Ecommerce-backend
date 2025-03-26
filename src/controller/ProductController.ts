import { AppDataSource } from "../config/databaseConnection";
import { Product } from "../models/Product";
import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { Cart, CartItem } from "../models/Cart";
import { User } from "../models/User";

const productRepository = AppDataSource.getRepository(Product);
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);

export const getAllProducts = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const products = await productRepository.find();
        res.status(200).json({ succcess: true, products: products });
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
                    product.category.toLowerCase() ===
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
                    .includes(product.brand.toLowerCase())
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

export const addProductToCart = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId, productId } = req.body;

        if (!userId) {
            next(new ErrorHandler("User ID is required", 400));
            return;
        }
        if (!productId) {
            next(new ErrorHandler("Product ID is required", 400));
            return;
        }

        const product = await productRepository.findOne({
            where: { id: productId },
        });

        if (!product) {
            next(new ErrorHandler("Product does not exist", 404));
            return;
        }

        let cart = await cartRepository.findOne({
            where: { user: { id: userId } },
            relations: { cartItems: true },
        });

        if (!cart) {
            cart = new Cart();
            cart.user = { id: userId } as User;
            cart.cartItems = [];
            await cartRepository.save(cart);
        }

        const existingCartItem = cart.cartItems.find(
            (item) => item.product.id === productId
        );

        if(existingCartItem){
            existingCartItem.quantity += 1;
            await cartItemRepository.save(existingCartItem);
        }else{
            const cartItem = new CartItem();
            cartItem.cart = cart;
            cartItem.product = product;
            cartItem.quantity = 1;
            await cartItemRepository.save(cartItem);
            cart.cartItems.push(cartItem);
            await cartRepository.save(cart);
        }

        res.status(201).json({
            success: true,
            message: "product added to cart",
            cart
        });
    }
);

export const getCart = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const cartData = await cartRepository.find();
        res.status(201).json({
            success: true,
            cartData,
            message: "product added to cart",
        });
    }
);
