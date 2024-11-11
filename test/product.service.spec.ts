import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from '@liaoliaots/nestjs-redis';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Product } from '../src/models/entities/product.entity';
import { CreateProductDto } from '../src/dtos/create-product.dto';
import Redis from 'ioredis';
import { ProductService } from '../src/modules/product/product.service';

describe('ProductService', () => {
  let productService: ProductService;
  let productModel: Model<Product>;
  let redisClient: jest.Mocked<Redis>;
  let redisService: RedisService;

  beforeEach(async () => {
    redisClient = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      mget: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            create: jest.fn().mockResolvedValue({}),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            exec: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(redisClient),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('getAllProducts', () => {
    it('should return an array of products', async () => {
      const products = [{ name: 'Product1' }, { name: 'Product2' }];
      jest.spyOn(productModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(products),
      } as any);

      const result = await productService.getAllProducts();
      expect(result).toEqual(products);
      expect(productModel.find).toHaveBeenCalled();
    });
  });

  describe('getProductById', () => {
    it('should return a product if it exists', async () => {
      const product = { _id: '1', name: 'Test Product' };
      jest.spyOn(productModel, 'findById').mockResolvedValue(product as any);

      const result = await productService.getProductById('1');
      expect(result).toEqual(product);
      expect(productModel.findById).toHaveBeenCalledWith('1');
    });

    it('should throw a NotFoundException if product does not exist', async () => {
      jest.spyOn(productModel, 'findById').mockResolvedValue(null);

      await expect(productService.getProductById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update the stock quantity and delete the cache', async () => {
      const productId = '1';
      const quantityChange = 1;
      const product = { _id: productId, name: 'Test Product', quantity: 5 };

      jest.spyOn(productModel, 'findByIdAndUpdate').mockResolvedValue(product as any);
      redisClient.del.mockResolvedValue(1);

      const result = await productService.updateStock(productId, quantityChange);
      expect(result).toEqual(product);
      expect(redisClient.del).toHaveBeenCalledWith(`product:${productId}`);
    });
  });

  describe('getProductsDetailsFromCache', () => {
    it('should retrieve products from cache and database if not in cache', async () => {
      const productIds = ['1', '2'];
      const cachedProduct = { _id: '1', name: 'Cached Product' };
      const dbProduct = { _id: '2', name: 'DB Product' };

      redisClient.mget.mockResolvedValue([JSON.stringify(cachedProduct), null]);
      jest.spyOn(productModel, 'find').mockResolvedValue([dbProduct] as any);
      redisClient.set.mockResolvedValue('OK');

      const result = await productService.getProductsDetailsFromCache(productIds);

      expect(result).toEqual({
        '1': cachedProduct,
        '2': dbProduct,
      });
      expect(redisClient.mget).toHaveBeenCalledWith('product:1', 'product:2');
      expect(redisClient.set).toHaveBeenCalledWith(
        `product:2`,
        JSON.stringify(dbProduct),
        'EX',
        3600,
      );
    });
  });
});
