import { Request, Response, NextFunction } from "express";

export const catchAsyncErrorHandler = <T>(
    func: (req: Request, res: Response<T>, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response<T>, next: NextFunction) => {
        func(req, res, next).catch((error) => next(error));
    };
};
