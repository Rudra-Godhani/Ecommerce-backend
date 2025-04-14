// import { Request, Response, NextFunction } from "express";
// import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
// import { Stripe } from "stripe";
// import { Address, Order, OrderItem, OrderStatus, User } from "../models/User";
// import { AppDataSource } from "../config/databaseConnection";
// import { ErrorHandler } from "../middleware/errorHandler";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// // export const createCheckoutSession = catchAsyncErrorHandler(
// //     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
// //         const productData = req.body;

// //         console.log("productData: ", productData);

// //         const lineItems = productData.map((data: any) => ({
// //             price_data: {
// //                 currency: "usd",
// //                 product_data: {
// //                     name: data.product.title,
// //                     images: data.product.images,
// //                 },
// //                 unit_amount: data.product.price * 100,
// //             },
// //             quantity: data.quantity,
// //         }));

// //         const session = await stripe.checkout.sessions.create({
// //             payment_method_types: ["card"],
// //             line_items: lineItems,
// //             mode: "payment",
// //             success_url: "http://localhost:5173/payment/success",
// //             cancel_url: "http://localhost:5173/payment/cancel",
// //         });

// //         res.json({
// //             success: true,
// //             id: session.id,
// //         });
// //     }
// // );

// const orderRepository = AppDataSource.getRepository(Order);
// const addressRepository = AppDataSource.getRepository(Address);

// interface AuthRequest extends Request {
//     user?: User;
// }

// export const createCheckoutSession = catchAsyncErrorHandler(
//     async (
//         req: AuthRequest,
//         res: Response,
//         next: NextFunction
//     ): Promise<void> => {
//         const data = req.body;

//         const address = await addressRepository.findOne({
//             where: { id: data.shippingAddress.id, user: { id: req.user?.id } },
//         });

//         if (!address) {
//             next(new ErrorHandler("Invalid shipping address", 404));
//             return;
//         }

//         const total = data.cartItems.reduce(
//             (sum: number, item: any) =>
//                 sum + item.product.price * item.quantity,
//             0
//         );

//         const deliveryCharge = 20.0;
//         const netTotal = total + deliveryCharge;

//         const orderItems = data.cartItems.map((item: any) => {
//             const orderItem = new OrderItem();
//             orderItem.quantity = item.quantity;
//             orderItem.price = item.product.price;
//             orderItem.totalPrice = item.product.price * item.quantity;
//             orderItem.product = item.product;
//             return orderItem;
//         });

//         const order = new Order();
//         order.total = total;
//         order.discount = 0;
//         order.netTotal = netTotal;
//         order.deliveryCharge = deliveryCharge;
//         order.status = OrderStatus.PLACED;
//         order.user = { id: req.user?.id } as User;
//         order.orderItems = orderItems;
//         order.address = address;

//         await orderRepository.save(order);
//         console.log("order.id:", order.id);

//         const lineItems = data.cartItems.map((data: any) => ({
//             price_data: {
//                 currency: "usd",
//                 product_data: {
//                     name: data.product.title,
//                     images: data.product.images,
//                 },
//                 unit_amount: Math.round(data.product.price * 100),
//             },
//             quantity: data.quantity,
//         }));

//         lineItems.push({
//             price_data: {
//                 currency: "usd",
//                 product_data: {
//                     name: "Delivery Charge",
//                 },
//                 unit_amount: Math.round(deliveryCharge * 100),
//             },
//         });

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: `http://localhost:5173/payment/success?orderId=${order.id}`,
//             cancel_url: "http://localhost:5173/payment/cancel",
//             metadata: {
//                 orderId: order.id,
//                 userId: req.user?.id as string,
//             },
//         });

//         order.stripeSessionId = session.id;
//         await orderRepository.save(order);

//         res.json({
//             success: true,
//             id: session.id,
//         });
//     }
// );

// export const handleStripeWebhook = catchAsyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         const sig = req.headers["stripe-signature"] as string;
//         const endpointSecret = process.env.STRIPE_WEBHOOK_KEY as string;

//         let event: Stripe.Event;

//         try {
//             event = stripe.webhooks.constructEvent(
//                 req.body,
//                 sig,
//                 endpointSecret
//             );
//         } catch (err: any) {
//             console.error(`Webhook Error: ${err.message}`);
//             next(new ErrorHandler(`Webhook Error: ${err.message}`, 400));
//             return;
//         }

//         const orderRepository = AppDataSource.getRepository(Order);

//         switch (event.type) {
//             case "checkout.session.completed":
//                 console.log("✅ Handling checkout.session.completed");
//                 const session = event.data.object as Stripe.Checkout.Session;
//                 const orderId = session.metadata?.orderId;
//                 console.log("Order ID from metadata:", orderId);

//                 if (orderId) {
//                     const order = await orderRepository.findOne({
//                         where: { id: orderId },
//                         relations: ["user", "orderItems", "address"],
//                     });

//                     if (order) {
//                         order.status = OrderStatus.PROCESSING; // Or whatever status you prefer
//                         await orderRepository.save(order);
//                         console.log(`Order ${order.id} payment completed`);
//                     }
//                 }
//                 break;

//             case "checkout.session.expired":
//             case "checkout.session.async_payment_failed":
//                 const failedSession = event.data
//                     .object as Stripe.Checkout.Session;
//                 const failedOrderId = failedSession.metadata?.orderId;

//                 if (failedOrderId) {
//                     const order = await orderRepository.findOne({
//                         where: { id: failedOrderId },
//                     });

//                     if (order) {
//                         order.status = OrderStatus.CANCELLED;
//                         await orderRepository.save(order);
//                         console.log(`Order ${order.id} payment failed`);
//                     }
//                 }
//                 break;

//             default:
//                 console.log(`Unhandled event type ${event.type}`);
//         }

//         res.status(200).json({ received: true });
//     }
// );

import { Request, Response, NextFunction } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { Stripe } from "stripe";
import { Address, Order, OrderItem, OrderStatus, User } from "../models/User";
import { AppDataSource } from "../config/databaseConnection";
import { ErrorHandler } from "../middleware/errorHandler";
import { Product } from "../models/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export const createCheckoutSession = catchAsyncErrorHandler(
//     async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//         const productData = req.body;

//         console.log("productData: ", productData);

//         const lineItems = productData.map((data: any) => ({
//             price_data: {
//                 currency: "usd",
//                 product_data: {
//                     name: data.product.title,
//                     images: data.product.images,
//                 },
//                 unit_amount: data.product.price * 100,
//             },
//             quantity: data.quantity,
//         }));

//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: "http://localhost:5173/payment/success",
//             cancel_url: "http://localhost:5173/payment/cancel",
//         });

//         res.json({
//             success: true,
//             id: session.id,
//         });
//     }
// );

const orderRepository = AppDataSource.getRepository(Order);
const addressRepository = AppDataSource.getRepository(Address);

interface AuthRequest extends Request {
    user?: User;
}

export const createCheckoutSession = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const data = req.body;

        const address = await addressRepository.findOne({
            where: { id: data.shippingAddress.id, user: { id: req.user?.id } },
        });

        if (!address) {
            next(new ErrorHandler("Invalid shipping address", 404));
            return;
        }

        const total = data.cartItems.reduce(
            (sum: number, item: any) =>
                sum + item.product.price * item.quantity,
            0
        );

        const deliveryCharge = 20.0;
        const netTotal = total + deliveryCharge;

        const lineItems = data.cartItems.map((data: any) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: data.product.title,
                    images: data.product.images,
                },
                unit_amount: Math.round(data.product.price * 100),
            },
            quantity: data.quantity,
        }));

        lineItems.push({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "Delivery Charge",
                },
                unit_amount: Math.round(deliveryCharge * 100),
            },
            quantity: 1,
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `http://localhost:5173/payment/success`,
            cancel_url: "http://localhost:5173/payment/cancel",
            metadata: {
                userId: req.user?.id as string,
                addressId: address.id,
                cartItems: JSON.stringify(
                    data.cartItems.map((item: any) => ({
                        productId: item.product.id,
                        quantity: item.quantity,
                        color: item.color,
                    }))
                ),
                deliveryCharge: deliveryCharge.toString(),
                total: total.toString(),
                netTotal: netTotal.toString(),
            },
        });

        res.json({
            success: true,
            id: session.id,
        });
    }
);

export const handleStripeWebhook = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const sig = req.headers["stripe-signature"] as string;
        const endpointSecret = process.env.STRIPE_WEBHOOK_KEY as string;

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                endpointSecret
            );
        } catch (err: any) {
            console.error(`Webhook Error: ${err.message}`);
            return next(new ErrorHandler(`Webhook Error: ${err.message}`, 400));
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const metadata = session.metadata;

                const userId = metadata?.userId;
                const addressId = metadata?.addressId;
                const cartItems = JSON.parse(metadata?.cartItems || "[]");
                const deliveryCharge = parseFloat(
                    metadata?.deliveryCharge || "0"
                );
                const total = parseFloat(metadata?.total || "0");
                const netTotal = parseFloat(metadata?.netTotal || "0");

                const address = await addressRepository.findOne({
                    where: { id: addressId },
                });

                if (!address) {
                    console.error("Address not found");
                    next(new ErrorHandler("Address not found", 404));
                    return;
                }

                // Fetch product data from DB
                const productRepository = AppDataSource.getRepository(Product);
                const orderItems = await Promise.all(
                    cartItems.map(async (item: any) => {
                        const product = await productRepository.findOne({
                            where: { id: item.productId },
                        });

                        if (!product) {
                            throw new ErrorHandler("Product not found", 404);
                        }

                        const orderItem = new OrderItem();
                        orderItem.quantity = item.quantity;
                        orderItem.price = product.price;
                        orderItem.totalPrice = product.price * item.quantity;
                        orderItem.product = product;
                        orderItem.color = item.color; // If your OrderItem entity has a color field
                        return orderItem;
                    })
                );

                const order = new Order();
                order.user = { id: userId } as User;
                order.address = address;
                order.orderItems = orderItems;
                order.total = total;
                order.netTotal = netTotal;
                order.discount = 0;
                order.deliveryCharge = deliveryCharge;
                order.status = OrderStatus.PROCESSING;
                order.stripeSessionId = session.id;

                await orderRepository.save(order);
                console.log(
                    `✅ Order created for user ${userId}, order id: ${order.id}`
                );
                break;
            }

            case "checkout.session.async_payment_failed":
            case "checkout.session.expired": {
                const session = event.data.object as Stripe.Checkout.Session;
                const failedUserId = session.metadata?.userId;
                console.warn(
                    `⚠️ Payment failed or session expired for user ${failedUserId}`
                );
                break;
            }

            case "payment_intent.succeeded": {
                const intent = event.data.object as Stripe.PaymentIntent;
                console.log(`✅ PaymentIntent succeeded: ${intent.id}`);
                break;
            }

            case "payment_intent.payment_failed": {
                const intent = event.data.object as Stripe.PaymentIntent;
                console.warn(`❌ PaymentIntent failed: ${intent.id}`);
                break;
            }

            case "charge.refunded": {
                const charge = event.data.object as Stripe.Charge;
                console.log(`💸 Charge refunded: ${charge.id}`);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    }
);
