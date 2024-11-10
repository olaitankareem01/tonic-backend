import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisConfigModule } from './configs/redis/redis.module';
import { CartModule } from './modules/cart/cart.module';
import { ProductModule } from './modules/product/product.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    RedisConfigModule, 
    CartModule, 
    ProductModule, 
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
