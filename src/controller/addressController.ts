import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../config/databaseConnection";
import { Address, User } from "../models/User";
import { ErrorHandler } from "../middleware/errorHandler";
import { validate } from "class-validator";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";

const addressRepository = AppDataSource.getRepository(Address);

interface AuthRequest extends Request {
    user?: User;
}

export const addNewAddress = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { line1, line2, city, state, pincode, isDefault } = req.body;

        let userNewAddress = addressRepository.create({
            line1,
            line2,
            city,
            state,
            pincode,
            isDefault: true,
            user: req.user,
        });

        if (isDefault) {
            userNewAddress.isDefault = isDefault;
        }

        const validationErrors = await validate(userNewAddress, {
            skipMissingProperties: true,
        });

        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        await addressRepository.update(
            { user: { id: req.user?.id }, isDefault: true },
            { isDefault: false }
        );

        const savedAddress = await addressRepository.save(userNewAddress);

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            addresses: savedAddress,
        });
    }
);
export const updateAddress = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { addressId } = req.params;
        const { line1, line2, city, state, pincode } = req.body;

        const address = await addressRepository.findOne({
            where: { id: addressId, user: { id: req.user?.id } },
        });

        if (!address) {
            next(new ErrorHandler("Address not found", 404));
            return;
        }

        if (line1 !== undefined) address.line1 = line1;
        if (line2 !== undefined) address.line2 = line2;
        if (city !== undefined) address.city = city;
        if (state !== undefined) address.state = state;
        if (pincode !== undefined) address.pincode = pincode;

        const validationErrors = await validate(address, {
            skipMissingProperties: true,
        });

        if (validationErrors.length > 0) {
            next(
                new ErrorHandler(
                    Object.values(validationErrors[0].constraints!)[0],
                    400
                )
            );
            return;
        }

        const updatedAddress = await addressRepository.save(address);

        res.status(200).json({
            success: true,
            message: "Address updated successfully",
            address: updatedAddress,
        });
    }
);

export const getUserAddresses = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const userAddresses = await addressRepository.find({
            where: { user: { id: req.user?.id } },
            order: { createdAt: "ASC" },
        });

        res.status(200).json({
            success: true,
            addresses: userAddresses,
        });
    }
);

export const setAddressAsDefault = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { addressId } = req.params;
        const address = await addressRepository.findOne({
            where: { id: addressId, user: { id: req.user?.id } },
        });

        if (!address) {
            next(new ErrorHandler("Address not found", 404));
            return;
        }

        await addressRepository.update(
            { user: { id: req.user?.id }, isDefault: true },
            { isDefault: false }
        );

        address.isDefault = true;
        const updatedAddress = await addressRepository.save(address);

        res.status(200).json({
            success: true,
            message: "Address successfully set as default",
            address: updatedAddress,
        });
    }
);

export const deleteAddress = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { addressId } = req.params;

        const address = await addressRepository.findOne({
            where: { id: addressId, user: { id: req.user?.id } },
        });

        if (!address) {
            next(new ErrorHandler("Address not found", 404));
            return;
        }

        const isDefaultAddress = address.isDefault;

        await addressRepository.remove(address);

        if (isDefaultAddress) {
            const remainingAddresses = await addressRepository.find({
                where: { user: { id: req.user?.id } },
                order: { id: "ASC" },
            });

            if (remainingAddresses.length > 0) {
                const firstAddress = remainingAddresses[0];
                firstAddress.isDefault = true;
                await addressRepository.save(firstAddress);
            }
        }

        const updatedAddresses = await addressRepository.find({
            where: { user: { id: req.user?.id } },
            order: { createdAt: "ASC" },
        });

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
            addresses: updatedAddresses,
        });
    }
);
