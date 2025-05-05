import { Category } from '../../categories/entities/category.entity';

export class Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}
