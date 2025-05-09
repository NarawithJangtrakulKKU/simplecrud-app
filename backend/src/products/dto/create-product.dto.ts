import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  categoryId: number;
}
