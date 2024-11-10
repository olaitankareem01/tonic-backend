import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Model } from 'mongoose';
import { CreateProductDto } from 'src/dtos/create-product.dto';
import { Product } from 'src/models/entities/product.entity';


@Injectable()
export class ProductService {
  private redisClient: Redis;
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>, 
  private readonly redisService: RedisService) 
 {
  this.redisClient = this.redisService.getOrThrow(); 
}

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }
  
  async getAllProducts() {
    return this.productModel.find().exec();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

async updateStock(productId: string, quantityChange: number) {
 
    const product = await this.productModel.findByIdAndUpdate(
      productId,
      { $inc: { quantity: -quantityChange } },
      { new: true }
    );
  

    const productKey = `product:${productId}`;
    await this.redisClient.del(productKey);
  
   
    if (product && product.quantity > 0) {
      await this.redisClient.set(productKey, JSON.stringify(product), 'EX', 3600); 
    }
  
    return product;
  }
  
  async getProductsByIds(productIds: string[]): Promise<Product[]> {
    return this.productModel.find({ _id: { $in: productIds } });
  }

  async getProductsDetailsFromCache(productIds: string[]): Promise<Record<string, any>> {
    const productKeyPrefix = 'product:';
    const productKeys = productIds.map(id => `${productKeyPrefix}${id}`);
    
    // retrieving product details from Redis cache
    const cachedProducts = await this.redisClient.mget(...productKeys);
    const products: Record<string, any> = {};
    const missingProductIds: string[] = [];
  
 
    productIds.forEach((id, index) => {
      const cachedData = cachedProducts[index];
      if (cachedData) {
        products[id] = JSON.parse(cachedData);
      } else {
        missingProductIds.push(id);
      }
    });
  
    //fetch missing products from database
    if (missingProductIds.length > 0) {
      const missingProducts = await this.getProductsByIds(missingProductIds);
  
      // Storing missing product data in cache for future requests
      for (const product of missingProducts) {
        products[product._id as string] = product;
        await this.redisClient.set(`${productKeyPrefix}${product._id}`, JSON.stringify(product), 'EX', 3600); // Cache for 1 hour
      }
    }
  
    return products;
  }
}
