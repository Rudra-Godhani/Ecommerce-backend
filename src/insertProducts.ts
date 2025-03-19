import { AppDataSource } from "./config/databaseConnection";
import { productsData } from "./data/allProductsData";
import { Product } from "./models/Product";

const productRepository = AppDataSource.getRepository(Product);
export const insertData = async () => {
    try {
         const existingProductsCount = await productRepository.count();
         console.log(existingProductsCount);
         if (existingProductsCount > 0) {
             console.log("Products already exist. Skipping insertion.");
             return;
         }

        const products = productsData.map((item) => {
            const product = new Product();
            product.title = item.title;
            product.descriptionSmall = item.descriptionSmall;
            product.descriptionLong = item.descriptionLong;
            product.price = item.price;
            product.retailPrice = item.retailPrice;
            product.images = item.images;
            product.colors = item.colors;
            product.availability = item.availability;
            product.reviewsText = item.reviewsText;
            product.noOfReviews = item.noOfReviews;
            product.rating = item.rating;
            product.brand = item.brand;
            product.category = item.category;
            product.additionalInformation = item.additionalInformation;
            return product;
        });

        await productRepository.save(products);
        console.log(`${products.length} products inserted successfully`);
    } catch (error) {
        console.log("Erorr inserting products:", error);
    }
};