import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
import { AppDataSource } from "../config/databaseConnection";
import { Cart, CartItem } from "../models/Cart";
import { Product } from "../models/Product";

const productRepository = AppDataSource.getRepository(Product);
const cartRepository = AppDataSource.getRepository(Cart);
const cartItemRepository = AppDataSource.getRepository(CartItem);
const userRepository = AppDataSource.getRepository(User);

interface AuthenticatedRequest extends Request {
    user?: User;
}

export const addProductToCart = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        const user = await userRepository.find({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        if (!productId) {
            next(new ErrorHandler("Product id is required", 400));
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
            relations: ["cartItems", "cartItems.product"],
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

        if (existingCartItem) {
            existingCartItem.quantity += 1;
        } else {
            const cartItem = new CartItem();
            cartItem.cart = cart;
            cartItem.product = product;
            cartItem.quantity = 1;
            await cartItemRepository.save(cartItem);
            cart.cartItems.push(cartItem);
        }

        await cartRepository.save(cart);
        res.status(201).json({
            success: true,
            message: "product added to cart",
            cart,
        });
    }
);

export const increaseQuantity = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        const user = await userRepository.find({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        if (!productId) {
            next(new ErrorHandler("Product id is required", 400));
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
            relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
            next(new ErrorHandler("Cart not found", 404));
            return;
        }

        const existingCartItem = cart.cartItems.find(
            (item) => item.product.id === productId
        );

        if (!existingCartItem) {
            next(new ErrorHandler("Product not found in cart", 404));
            return;
        }

        existingCartItem.quantity += 1;

        await cartRepository.save(cart);
        res.status(201).json({
            success: true,
            message: "product quantity increased",
            cart,
        });
    }
);

export const removeProductFromCart = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product id is required", 400));
            return;
        }

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        let cart = await cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
            next(new ErrorHandler("Cart not found", 404));
            return;
        }

        const cartItem = cart.cartItems.find(
            (item) => item.product.id === productId
        );

        if (!cartItem) {
            next(new ErrorHandler("Product not found in cart", 404));
            return;
        }

        cart.cartItems = cart.cartItems.filter(
            (item) => item.product.id !== productId
        );
        await cartItemRepository.remove(cartItem);

        await cartRepository.save(cart);
        res.status(201).json({
            success: true,
            message: "Product removed to cart",
            cart,
        });
    }
);

export const decreaseQuantity = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product id is required", 400));
            return;
        }

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        let cart = await cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
            next(new ErrorHandler("Cart not found", 404));
            return;
        }

        const cartItem = cart.cartItems.find(
            (item) => item.product.id === productId
        );

        if (!cartItem) {
            next(new ErrorHandler("Product not found in cart", 404));
            return;
        }

        cartItem.quantity -= 1;
        await cartRepository.save(cart);
        res.status(201).json({
            success: true,
            cart,
        });
    }
);


export const getCart = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const cart = await cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
            next(new ErrorHandler("Cart not found", 404));
            return;
        }

        res.status(201).json({
            success: true,
            message: "Cart retrieved successfully",
            cart,
        });
    }
);