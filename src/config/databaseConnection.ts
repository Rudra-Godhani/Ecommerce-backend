import "reflect-metadata";
import { DataSource } from "typeorm";

console.log("DATABASE_URL 1: ", process.env.DATABASE_URL);
export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: ["src/models/*.ts"],
    migrations: ["src/migrations/*.ts"],
    subscribers: [],
    ssl: {
        rejectUnauthorized: false,
    },
});

console.log("DATABASE_URL 2: ", process.env.DATABASE_URL);
export const databaseConnect = async () => {
    console.log("DATABASE_URL 3: ", process.env.DATABASE_URL);
    try {
        console.log("DATABASE_URL 4: ", process.env.DATABASE_URL);
        await AppDataSource.initialize();
        console.log("DATABASE_URL 5: ", process.env.DATABASE_URL);
        console.log("database connected successfully");
    } catch (error) {
        console.log("DATABASE_URL 7: ", process.env.DATABASE_URL);
        console.log("Database connection error:", error);
    }
};
