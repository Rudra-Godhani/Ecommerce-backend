"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const cartRoutes_1 = __importDefault(require("./routes/cartRoutes"));
const paymentRoute_1 = __importDefault(require("./routes/paymentRoute"));
const wishListRoutes_1 = __importDefault(require("./routes/wishListRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const addressRoutes_1 = __importDefault(require("./routes/addressRoutes"));
const contactUsRoutes_1 = __importDefault(require("./routes/contactUsRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const databaseConnection_1 = require("./config/databaseConnection");
const cloudinary_1 = require("./config/cloudinary");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const errorHandler_1 = require("./middleware/errorHandler");
const paymentController_1 = require("./controller/paymentController");
const updateOrderStatus_1 = require("./utils/updateOrderStatus");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 6000;
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.post("/api/v1/payment/webhook", express_1.default.raw({ type: "application/json" }), paymentController_1.handleStripeWebhook);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/product", productRoutes_1.default);
app.use("/api/v1/cart", cartRoutes_1.default);
app.use("/api/v1/wishlist", wishListRoutes_1.default);
app.use("/api/v1/payment", paymentRoute_1.default);
app.use("/api/v1/order", orderRoutes_1.default);
app.use("/api/v1/contact", contactUsRoutes_1.default);
app.use("/api/v1/address", addressRoutes_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    // connect to database
    yield (0, databaseConnection_1.databaseConnect)();
    // connect to the cloudinary
    (0, cloudinary_1.cloudinaryConnect)();
    // insert data to database
    // await insertData();
});
startServer();
app.use(errorHandler_1.errorMiddleware);
(0, updateOrderStatus_1.orderStatusCron)();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
