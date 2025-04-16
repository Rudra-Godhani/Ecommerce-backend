import cron from "node-cron";
import { AppDataSource } from "../config/databaseConnection";
import { LessThanOrEqual } from "typeorm";
import { Order, OrderStatus } from "../models/User";

const getDateNMinutesAgo = (minutes: number): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - minutes);
    return date;
};

export const orderStatusCron = () => {
    cron.schedule("*/5 * * * *", async () => {
        console.log("⏰ Running 5-min order status updater...");

        const orderRepo = AppDataSource.getRepository(Order);

        try {
            const processingOrders = await orderRepo.find({
                where: {
                    status: OrderStatus.PROCESSING,
                    createdAt: LessThanOrEqual(getDateNMinutesAgo(5)),
                },
            });

            for (const order of processingOrders) {
                order.status = OrderStatus.SHIPPED;
                order.updatedAt = new Date();
                await orderRepo.save(order);
                console.log(`🚚 Order ${order.id} marked as SHIPPED`);
            }

            const shippedOrders = await orderRepo.find({
                where: {
                    status: OrderStatus.SHIPPED,
                    updatedAt: LessThanOrEqual(getDateNMinutesAgo(5)),
                },
            });

            for (const order of shippedOrders) {
                order.status = OrderStatus.DELIVERED;
                await orderRepo.save(order);
                console.log(`📦 Order ${order.id} marked as DELIVERED`);
            }

            console.log("✅ Order statuses updated.");
        } catch (err) {
            console.error("❌ Error updating order statuses:", err);
        }
    });
};
