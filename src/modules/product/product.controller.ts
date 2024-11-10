import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';

import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProductDto } from 'src/dtos/create-product.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  
  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts() {
    return this.productService.getAllProducts()
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }


  @ApiBearerAuth('Authorization')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'ID of the product to retrieve' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  async getProduct(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }
}
