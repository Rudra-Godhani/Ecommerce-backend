"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConnect = void 0;
const data_source_1 = require("./data-source");
const databaseConnect = () => {
    data_source_1.AppDataSource.initialize()
        .then(() => {
        console.log("database connected successfully");
    })
        .catch((error) => console.log("Database connection error:", error));
};
exports.databaseConnect = databaseConnect;
