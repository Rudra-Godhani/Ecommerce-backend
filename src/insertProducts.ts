import { AppDataSource } from "./config/databaseConnection";
import { productsData } from "./data/allProductsData";
import { Brand, Category, Product } from "./models/Product";

const productRepository = AppDataSource.getRepository(Product);
const categoryRepository = AppDataSource.getRepository(Category);
const brandRepository = AppDataSource.getRepository(Brand);

export const insertData = async () => {
    try {
        const existingProductsCount = await productRepository.count();
        console.log(existingProductsCount);
        if (existingProductsCount > 0) {
            console.log("Products already exist. Skipping insertion.");
            return;
        }

        for (const productData of productsData) {
            // Fetch or create category
            let category = await categoryRepository.findOne({
                where: { name: productData.category },
            });
            if (!category) {
                category = categoryRepository.create({
                    name: productData.category,
                });
                await categoryRepository.save(category);
            }

            // Fetch brand including existing categories
            let brand = await brandRepository.findOne({
                where: { name: productData.brand },
                relations: ["categories"], // Ensure we get associated categories
            });

            if (!brand) {
                brand = brandRepository.create({
                    name: productData.brand,
                    categories: [category],
                });
            } else {
                // Ensure the brand is associated with the category
                if (!brand.categories.some((c) => c.id === category!.id)) {
                    brand.categories.push(category);
                }
            }
            await brandRepository.save(brand); // Save brand with updated categories

            // Create product entry
            const product = productRepository.create({
                title: productData.title,
                descriptionSmall: productData.descriptionSmall,
                descriptionLong: productData.descriptionLong,
                price: productData.price,
                retailPrice: productData.retailPrice,
                images: productData.images,
                colors: productData.colors,
                availability: productData.availability,
                reviewsText: productData.reviewsText,
                noOfReviews: productData.noOfReviews,
                rating: productData.rating,
                category: category,
                brand: brand,
                additionalInformation: productData.additionalInformation,
            });

            await productRepository.save(product);
        }

        console.log("Products added successfully");
    } catch (error) {
        console.log("Error inserting products:", error);
    }
};
