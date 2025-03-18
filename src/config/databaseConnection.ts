import { AppDataSource } from "./data-source";

export const databaseConnect = async () => {
    console.log('enjhcg: ', process.env.DATABASE_URL)
    try {
        await AppDataSource.initialize();
        console.log("database connected successfully");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};
