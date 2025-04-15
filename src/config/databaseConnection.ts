import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: ["dist/models/*.js"],
    migrations: ["dist/migrations/*.js"],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false,
    },
});

export const databaseConnect = async () => {
    try {
        await AppDataSource.initialize();
        console.log("database connected successfully");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};
