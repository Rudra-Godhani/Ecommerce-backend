"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const databaseConnection_1 = require("./config/databaseConnection");
const cloudinary_1 = require("./config/cloudinary");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 6000;
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: "/tmp/",
}));
app.use("/api/v1/user", userRoutes_1.default);
app.get("/", (req, res) => {
    res.send("hello, typescript backend!");
});
//connect to database
(0, databaseConnection_1.databaseConnect)();
//connect to the cloudinary
(0, cloudinary_1.cloudinaryConnect)();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
