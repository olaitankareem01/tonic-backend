import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductService } from '../product/product.service';
import { Redis } from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Order } from 'src/models/entities/order.entity';

@Injectable()
export class CartService {
    private redisClient: Redis;

    constructor(
      @InjectModel(Order.name) private readonly orderModel: Model<Order>,
      private readonly productService: ProductService,
      private readonly redisService: RedisService,
    ) {
      this.redisClient = this.redisService.getOrThrow(); 
    }

  async addItemToCart(userId: string, productId: string, quantity: number) {
    const product = await this.productService.getProductById(productId);
    if (product.quantity < quantity) throw new Error('Not enough stock');

    const cartKey = `cart:${userId}`;
    const lockKey = `lock:${productId}`;

    // Lock to handle concurrency issues
    await this.redisClient.setnx(lockKey, userId);

    const cartData = await this.redisClient.get(cartKey);
    let cart = cartData ? JSON.parse(cartData) : { userId, products: [] };
    const productIdObject = new Types.ObjectId(product._id as string);

    let productInCart = cart.products.find((p) => {
 
  const productIdInCart = typeof p.productId === 'string' ? new Types.ObjectId(p.productId) : p.productId;
    return productIdInCart.equals(productIdObject);
    });

    if (productInCart) {
    productInCart.quantity += quantity;
    } else {
    cart.products.push({ productId: productIdObject, quantity });
    }

    await this.redisClient.set(cartKey, JSON.stringify(cart));
    await this.redisClient.del(lockKey);

    return cart;
  }

  async checkout(userId: string) {
    const cartKey = `cart:${userId}`;
    const cartData = await this.redisClient.get(cartKey);
    if (!cartData) throw new Error('Cart not found');

    const cart = JSON.parse(cartData);

    // Revalidating stock for each product
    let totalPrice = 0;
    for (const item of cart.products) {
      const product = await this.productService.getProductById(item.productId.toString());
      if (product.quantity < item.quantity) throw new Error(`Not enough stock for product ${item.productId}`);
      totalPrice += product.price * item.quantity; 
    }

    for (const item of cart.products) {
      await this.productService.updateStock(item.productId.toString(), item.quantity);
    }

    const order = new this.orderModel({
      userId,
      products: cart.products,
      totalPrice,
      status: 'Pending',
      createdAt: new Date(),
    });
    await order.save();

    await this.redisClient.del(cartKey);

    return { message: 'Checkout successful', order };
  }


  async removeFromCart(userId: string, productId: string, quantity: number) {
    const cartKey = `cart:${userId}`;
    const cartData = await this.redisClient.get(cartKey);
    if (!cartData) throw new Error('Cart not found');

    const cart = JSON.parse(cartData);
    const productIdObject = new Types.ObjectId(productId);
    const productInCart = cart.products.find((p) => {
        const productIdInCart = typeof p.productId === 'string' ? new Types.ObjectId(p.productId) : p.productId;
        return productIdInCart.equals(productIdObject);
      });
      
      if (!productInCart) throw new Error('Product not found in cart');
      
      if (quantity >= productInCart.quantity) {
        //  product is removed  from cart if quantity to remove is equal or greater than in cart
        cart.products = cart.products.filter((p) => {
          const productIdInCart = typeof p.productId === 'string' ? new Types.ObjectId(p.productId) : p.productId;
          return !productIdInCart.equals(productIdObject);
        });
      } else {
        productInCart.quantity -= quantity;
      }
    await this.redisClient.set(cartKey, JSON.stringify(cart));
    return cart;
  }


  async getCartDetails(userId: string) {
    const cartKey = `cart:${userId}`;
  
    const cartData = await this.redisClient.get(cartKey);
    if (!cartData) {
      throw new Error('Cart not found');
    }
  

    const cart = JSON.parse(cartData);
    

    const cartDetails = {
      userId,
      products: [],
      totalAmount: 0,
    };
  

    const productIds = cart.products.map(item => item.productId);
    
    const products = await this.productService.getProductsDetailsFromCache(productIds);
  
    for (const item of cart.products) {
      const product = products[item.productId];
  
      if (product) {

        const productDetails = {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          total: item.quantity * product.price,
        };
        cartDetails.products.push(productDetails);

        cartDetails.totalAmount += productDetails.total;
      }
    }
  
    return cartDetails;
  }
  
}
