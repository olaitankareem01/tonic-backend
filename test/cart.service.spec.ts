import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { Order } from '../src/models/entities/order.entity';
import { Model, Types } from 'mongoose';
import { CartService } from '../src/modules/cart/cart.service';
import { ProductService } from '../src/modules/product/product.service';
import Redis from 'ioredis';

describe('CartService', () => {
  let cartService: CartService;
  let orderModel: Model<Order>;
  let productService: ProductService;
  let redisClient: jest.Mocked<Redis>;
  let redisService: RedisService;

  beforeEach(async () => {
    redisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      setnx: jest.fn().mockResolvedValue(1),
      mget: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Order.name),
          useValue: {
            new: jest.fn().mockResolvedValue({}),
            save: jest.fn(),
          },
        },
        {
          provide: ProductService,
          useValue: {
            getProductById: jest.fn(),
            updateStock: jest.fn(),
            getProductsDetailsFromCache: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue({
              set: jest.fn(),
              get: jest.fn(),
              del: jest.fn(),
              setnx: jest.fn(),
              mget: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    orderModel = module.get<Model<Order>>(getModelToken(Order.name));
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCart', () => {
    it('should throw an error if not enough stock', async () => {
      const userId = 'user123';
      const productId = 'product123';
      const quantity = 5;
      const product = { _id: productId, quantity: 2 };

      jest.spyOn(productService, 'getProductById').mockResolvedValue(product as any);

      await expect(cartService.addItemToCart(userId, productId, quantity)).rejects.toThrow(
        'Not enough stock',
      );
    });
  });

  describe('checkout', () => {


    it('should throw an error if cart not found', async () => {
      const userId = 'user123';

      redisClient.get.mockResolvedValue(null);

      await expect(cartService.checkout(userId)).rejects.toThrow('Cart not found');
    });
  });
});
