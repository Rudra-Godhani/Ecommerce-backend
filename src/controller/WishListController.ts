import { AppDataSource } from "../config/databaseConnection";
import { ErrorHandler } from "../middleware/errorHandler";
import { Product } from "../models/Product";
import { User } from "../models/User";
import { WishList, WishListItem } from "../models/WishList";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { Request, Response, NextFunction } from "express";

const productRepository = AppDataSource.getRepository(Product);
const wishListRepository = AppDataSource.getRepository(WishList);
const wishListItemRepository = AppDataSource.getRepository(WishListItem);
const userRepository = AppDataSource.getRepository(User);

interface AuthenticatedRequest extends Request {
    user?: User;
}
export const addProductToWishList = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product id is required.", 400));
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

        let wishList = await wishListRepository.findOne({
            where: { user: { id: userId } },
            relations: ["wishListItems", "wishListItems.product"],
        });

        if (!wishList) {
            wishList = new WishList();
            wishList.user = { id: userId } as User;
            wishList.wishListItems = [];
            await wishListRepository.save(wishList);
        }

        const existingWishListItem = wishList.wishListItems.find(
            (item) => item.product.id === productId
        );

        if (existingWishListItem) {
            next(new ErrorHandler("Product already exists in wishlist", 400));
            return;
        } else {
            const wishListItem = new WishListItem();
            wishListItem.wishList = wishList;
            wishListItem.product = product;
            await wishListItemRepository.save(wishListItem);
            wishList.wishListItems.push(wishListItem);
        }

        await wishListRepository.save(wishList);
        res.status(201).json({
            success: true,
            message: "product added to wishlist",
            wishList,
        });
    }
);

export const removeProductFromWishList = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { productId } = req.body;

        if (!productId) {
            next(new ErrorHandler("Product id is required.", 400));
        }

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            next(new ErrorHandler("User not found", 404));
            return;
        }

        let wishList = await wishListRepository.findOne({
            where: { user: { id: userId } },
            relations: ["wishListItems", "wishListItems.product"],
        });

        if (!wishList) {
            next(new ErrorHandler("Wishlist not found", 404));
            return;
        }

        const wishListItem = wishList.wishListItems.find(
            (item) => item.product.id === productId
        );

        if (!wishListItem) {
            next(new ErrorHandler("Product not found in wishlist", 404));
            return;
        }
        wishList.wishListItems = wishList.wishListItems.filter((item) => {
            return item.product.id !== productId;
        });

        await wishListItemRepository.remove(wishListItem);

        await wishListRepository.save(wishList);
        res.status(201).json({
            success: true,
            message: "product removed from wishlist",
            wishList,
        });
    }
);

export const getWishList = catchAsyncErrorHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const wishList = await wishListRepository.findOne({
            where: { user: { id: userId } },
            relations: ["wishListItems", "wishListItems.product"],
        });

        if (!wishList) {
            next(new ErrorHandler("wishlist not found", 404));
            return;
        }

        res.status(201).json({
            success: true,  
            message: "wishlist retrieved successfully",
            wishList,
        });
    }
);
