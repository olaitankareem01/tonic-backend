import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddItemToCartDto } from 'src/dtos/add-to-cart.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addItemToCart(
    @Request() req,
    @Body() addItemToCartDto: AddItemToCartDto,
  ) {
    const userId = req.user.sub;
    const { productId, quantity } = addItemToCartDto;
    return this.cartService.addItemToCart(userId, productId, quantity);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post('remove')
  async removeItemFromCart(
    @Request() req,
    @Body() addItemToCartDto: AddItemToCartDto,
  ) {
    const userId = req.user.sub;
    const { productId, quantity } = addItemToCartDto;
    return this.cartService.removeFromCart(userId, productId, quantity);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(
    @Request() req
  ) {
    const userId = req.user.sub;
    return this.cartService.getCartDetails(userId);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkout(@Request() req) {
    const userId = req.user.sub;
    return this.cartService.checkout(userId);
  }
}
