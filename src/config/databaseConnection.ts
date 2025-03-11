import { AppDataSource } from "./data-source";

export const databaseConnect = () => {
    AppDataSource.initialize()
        .then(() => {
            console.log("database connected successfully");
        })
        .catch((error) => console.log("Database connection error:", error));
};
