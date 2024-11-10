import { Module } from '@nestjs/common';


import { User, UserSchema } from 'src/models/entities/user.entity';
import { JwtStrategy } from 'src/helpers/jwt.strategy'
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductService } from '../product/product.service';
import { Product, ProductSchema } from 'src/models/entities/product.entity';
import { JwtService } from '@nestjs/jwt';
import { Order, OrderSchema } from 'src/models/entities/order.entity';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema:ProductSchema},{ name:Order.name, schema:OrderSchema}]),
  ],
  providers: [CartService,ProductService,JwtService],
  controllers: [CartController],
})
export class CartModule {}
