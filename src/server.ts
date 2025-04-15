import express from "express";
import "dotenv/config";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import paymentRoutes from "./routes/paymentRoute";
import wishListRoutes from "./routes/wishListRoutes";
import orderRoutes from "./routes/orderRoutes";
import addressRoutes from "./routes/addressRoutes";
import contactUsRoutes from "./routes/contactUsRoutes";
import cookieParser from "cookie-parser";
import { databaseConnect } from "./config/databaseConnection";
import { cloudinaryConnect } from "./config/cloudinary";
import fileUpload from "express-fileupload";
import { errorMiddleware } from "./middleware/errorHandler";
import { handleStripeWebhook } from "./controller/paymentController";
import { orderStatusCron } from "./utils/updateOrderStatus";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(
    cors({
        origin: [process.env.FRONTEND_URL as string],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
)

app.post(
    "/api/v1/payment/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishListRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/contact", contactUsRoutes);
app.use("/api/v1/address", addressRoutes);

const startServer = async () => {
    // connect to database
    await databaseConnect();

    // connect to the cloudinary
    cloudinaryConnect();

    // insert data to database
    // await insertData();
};

startServer();
app.use(errorMiddleware);
orderStatusCron();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
