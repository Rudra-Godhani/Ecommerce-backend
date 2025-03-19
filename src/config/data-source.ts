// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import { User } from "../models/User";
// import { Product } from "../models/Product";

// export const AppDataSource = new DataSource({
//     type: "postgres",
//     url: process.env.DATABASE_URL,
//     // host: process.env.PGHOST || "localhost",
//     // port: Number(process.env.PGPORT) || 5432,
//     // username: process.env.PGUSER || "postgres",
//     // password: process.env.PGPASSWORD || "password",
//     // database: process.env.PGDATABASE || "ecommerceapp",
//     synchronize: true,
//     logging: false,
//     // entities: ["src/models/*.ts"],
//     entities: [User,Product],
//     migrations: ["src/migrations/*.ts"],
//     subscribers: [],
//     ssl: {
//         rejectUnauthorized: false,
//     },
// });