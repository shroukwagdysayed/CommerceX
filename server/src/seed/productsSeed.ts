import axios from 'axios';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import Product from '../models/Product';

// Load environment variables from .env
dotenv.config();

interface DummyProduct {
  title: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  stock?: number;
  images?: string[];
  rating?: number;
}

interface DummyJSONResponse {
  products: DummyProduct[];
}

const seedProducts = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Fetching products from DummyJSON API...');
    const { data } = await axios.get<DummyJSONResponse>('https://dummyjson.com/products');

    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('Invalid response data from DummyJSON API');
    }

    console.log(`Successfully fetched ${data.products.length} products.`);

    console.log('Clearing existing products from database...');
    const deleteResult = await Product.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} products.`);

    console.log('Mapping products to Mongoose schema...');
    const mappedProducts = data.products.map((item) => ({
      title: item.title,
      description: item.description,
      price: item.price || 0,
      category: item.category || 'General',
      brand: item.brand || 'Generic',
      stock: item.stock !== undefined ? item.stock : 0,
      images: Array.isArray(item.images) ? item.images : [],
      rating: item.rating !== undefined ? item.rating : 0,
    }));

    console.log('Inserting products into MongoDB...');
    const insertedProducts = await Product.insertMany(mappedProducts);
    console.log(`Successfully seeded ${insertedProducts.length} products into the database!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', (error as Error).message);
    process.exit(1);
  }
};

seedProducts();
