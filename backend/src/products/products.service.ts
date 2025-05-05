import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
        include: { category: true },
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
    });
  }
}
