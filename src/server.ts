import express from "express";
import "dotenv/config";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishListRoutes from "./routes/wishListRoutes";
import cookieParser from "cookie-parser";
import { databaseConnect } from "./config/databaseConnection";
import { cloudinaryConnect } from "./config/cloudinary";
import fileUpload from "express-fileupload";
import { insertData } from "./insertProducts";
import { errorMiddleware } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 6000;

app.use(
    cors({
        origin: [process.env.FRONTEND_URL as string],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
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

// app.get("/", (req, res) => {
//     res.send("hello, typescript backend!");
// });

// //connect to database
// databaseConnect();
// //connect to the cloudinary
// cloudinaryConnect();
// insertData();

const startServer = async () => {
    // connect to database
    await databaseConnect();

    // connect to the cloudinary
    cloudinaryConnect();

    // insert data to database
    await insertData();
};

startServer();
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
