import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(create: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: create.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const password = await hash(create.password, 10);
    const createdUser = await this.prisma.user.create({
      data: { ...create, password },
    });
    return plainToInstance(UserEntity, createdUser);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return plainToInstance(UserEntity, users);
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return plainToInstance(UserEntity, user);
  }
}
