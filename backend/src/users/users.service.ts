import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findbyid(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(email: string, password: string, name?: string) {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await this.hashedPassword(password);

    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  }
  async findAll() {
    return this.prisma.user.findMany();
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async hashedPassword(password: string) {
    const saltRound = 10;
    return bcrypt.hash(password, saltRound);
  }
}
