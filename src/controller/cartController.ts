import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";
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
        const { productId, color } = req.body;

        if (!productId || !color) {
            next(new ErrorHandler("Product ID and color is required", 400));
            return;
        }

        const user = await userRepository.find({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
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
            cartItem.color = color;
            await cartItemRepository.save(cartItem);
            cart.cartItems.push(cartItem);
        }

        await cartRepository.save(cart);

        const cartData = cart.cartItems.map((item) => ({
            quantity: item.quantity,
            product: item.product,
            color: item.color,
        }));

        if (existingCartItem) {
            res.status(200).json({
                success: true,
                cartData,
            });
        } else {
            res.status(201).json({
                success: true,
                message: "product added to cart",
                cartData,
            });
        }
    }
);

export const increaseQuantity = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product ID is required", 400));
            return;
        }

        const user = await userRepository.find({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
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

        if (!cart || cart.cartItems.length === 0) {
            next(new ErrorHandler("Cart not found or empty", 404));
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
        const cartData = cart.cartItems.map((item) => ({
            quantity: item.quantity,
            product: item.product,
            color: item.color,
        }));

        res.status(200).json({
            success: true,
            cartData,
        });
    }
);

export const removeProductFromCart = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product ID is required", 400));
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

        if (!cart || cart.cartItems.length === 0) {
            next(new ErrorHandler("Cart not found or empty", 404));
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
        const cartData = cart.cartItems.map((item) => ({
            quantity: item.quantity,
            product: item.product,
            color: item.color,
        }));

        res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cartData,
        });
    }
);

export const decreaseQuantity = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product ID is required", 400));
            return;
        }

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
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

        const cartItem = cart.cartItems.find(
            (item) => item.product.id === productId
        );

        if (!cartItem) {
            next(new ErrorHandler("Product not found in cart", 404));
            return;
        }

        cartItem.quantity -= 1;
        if (cartItem.quantity <= 0) {
            cart.cartItems = cart.cartItems.filter(
                (item) => item.product.id !== productId
            );
            await cartItemRepository.remove(cartItem);
        }
        await cartRepository.save(cart);
        const cartData = cart.cartItems.map((item) => ({
            quantity: item.quantity,
            product: item.product,
            color: item.color,
        }));

        res.status(200).json({
            success: true,
            cartData,
        });
    }
);

export const getCart = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const user = await userRepository.findOne({ where: { id: userId } });
        console.log("user cart:", user);

        const cart = await cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ["cartItems", "cartItems.product"],
        });

        if (!cart) {
            res.status(200).json({
                success: true,
                message: "Cart is Empty",
                cartData: [],
            });
            return;
        }

        const cartData = cart.cartItems.map((item) => ({
            quantity: item.quantity,
            product: item.product,
            color: item.color,
        }));

        res.status(200).json({
            success: true,
            cartData,
        });
    }
);
