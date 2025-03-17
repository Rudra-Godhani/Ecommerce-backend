import { AppDataSource } from "./data-source";

export const databaseConnect = async () => {
    try {
        await AppDataSource.initialize();
        console.log("database connected successfully");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};
