
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Name of the product' })
  name: string;

  @ApiProperty({ example: 1000, description: 'Price of the product' })
  price: number;

  @ApiProperty({ example: 50, description: 'Quantity of the product in stock' })
  quantity: number;
}



