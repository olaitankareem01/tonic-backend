import { Module } from '@nestjs/common';
import { User, UserSchema } from 'src/models/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product, ProductSchema } from 'src/models/entities/product.entity';
import { JwtService } from '@nestjs/jwt';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema:ProductSchema}]),
  ],
  providers: [ProductService,JwtService],
  controllers: [ProductController],
})
export class ProductModule {}
