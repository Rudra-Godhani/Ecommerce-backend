import { Request, Response, NextFunction } from "express";
import { catchAsyncErrorHandler } from "../utils/catchAsyncErrorHandler";
import { Stripe } from "stripe";
import { Address, Order, OrderItem, OrderStatus, User } from "../models/User";
import { AppDataSource } from "../config/databaseConnection";
import { ErrorHandler } from "../middleware/errorHandler";
import { ConsumedSession } from "../models/ConsumedSession";
import { Product } from "../models/Product";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const orderRepository = AppDataSource.getRepository(Order);
const addressRepository = AppDataSource.getRepository(Address);
const consumedSessionRepository = AppDataSource.getRepository(ConsumedSession);

interface AuthRequest extends Request {
    user?: User;
}

interface ProductData {
    id: string;
    title: string;
    descriptionSmall: string;
    descriptionLong: string[];
    price: number;
    retailPrice: number;
    images: string[];
    colors: string[];
    availability: boolean;
    reviewsText: string[];
    noOfReviews: number;
    rating: number;
    brand: string;
    category: string;
    additionalInformation: string;
}

interface CartItem {
    quantity: number;
    product: ProductData;
    color: string;
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
            (sum: number, item: CartItem) =>
                sum + item.product.retailPrice * item.quantity,
            0
        );

        const deliveryCharge = 100.0;
        const netTotal = total + deliveryCharge;

        const lineItems = data.cartItems.map((data: CartItem) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: data.product.title,
                    images: data.product.images,
                },
                unit_amount: Math.round(data.product.retailPrice * 100),
            },
            quantity: data.quantity,
        }));

        lineItems.push({
            price_data: {
                currency: "inr",
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
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/failed?session_id={CHECKOUT_SESSION_ID}`,
            metadata: {
                userId: req.user?.id as string,
                addressId: address.id,
                cartItems: JSON.stringify(
                    data.cartItems.map((item: CartItem) => ({
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
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Unknown error";
            next(new ErrorHandler(`Webhook Error: ${message}`, 400));
            return;
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
                    next(new ErrorHandler("Address not found", 404));
                    return;
                }

                const productRepository = AppDataSource.getRepository(Product);
                const orderItems = await Promise.all(
                    cartItems.map(
                        async (item: {
                            productId: string;
                            quantity: number;
                            color: string;
                        }) => {
                            const product = await productRepository.findOne({
                                where: { id: item.productId },
                            });

                            if (!product) {
                                next(
                                    new ErrorHandler("Product not found", 404)
                                );
                                return;
                            }

                            const orderItem = new OrderItem();
                            orderItem.quantity = item.quantity;
                            orderItem.price = product.retailPrice;
                            orderItem.totalPrice =
                                product.retailPrice * item.quantity;
                            orderItem.product = product;
                            orderItem.color = item.color;
                            return orderItem;
                        }
                    )
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

export const validateSession = catchAsyncErrorHandler(
    async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { session_id } = req.query;

        if (!session_id || typeof session_id !== "string") {
            next(new ErrorHandler("Invalid session ID", 400));
            return;
        }

        const existingSession = await consumedSessionRepository.findOne({
            where: { sessionId: session_id },
        });

        if (existingSession) {
            next(
                new ErrorHandler(
                    "This payment session has already been used",
                    403
                )
            );
            return;
        }

        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);

            if (!session) {
                next(new ErrorHandler("Session not found", 404));
                return;
            }

            const consumedSession = new ConsumedSession();
            consumedSession.sessionId = session_id;
            consumedSession.consumedAt = new Date();
            await consumedSessionRepository.save(consumedSession);

            res.json({
                success: true,
                status: session.payment_status,
                sessionId: session.id,
                message: "Session validated successfully",
            });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Unknown error";
            next(new ErrorHandler(`Session Validation Error: ${message}`, 500));
            return;
        }
    }
);
