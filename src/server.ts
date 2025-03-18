import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import productRoutes from "./routes/productRoutes";
import cookieParser from "cookie-parser";
import { databaseConnect } from "./config/databaseConnection";
import { cloudinaryConnect } from "./config/cloudinary";
import fileUpload from "express-fileupload";
import { insertData } from "./insertProducts";

dotenv.config();

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
app.use("/api/v1/prodyct", productRoutes);

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
