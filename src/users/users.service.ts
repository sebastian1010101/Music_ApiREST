import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { JwtAuthDto } from './auth/jwt/jwt.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async create(create: CreateUserDto) {
    const verifyUniqueEmail = await this.prisma.user.findUnique({
      where: { email: create.email },
    });

    if (verifyUniqueEmail) {
      throw new ConflictException('Email already in use');
    }

    const userEntity = new UserEntity(create);
    await userEntity.hashPassword();
    const createUser = await this.prisma.user.create({ data: userEntity });

    return createUser;
  }

  async findAll() {
    const findUsers = await this.prisma.user.findMany();
    return plainToInstance(UserEntity, findUsers);
  }

  async findById(userId: string) {
    const findUser = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!findUser) {
      throw new NotFoundException('User not found');
    }
    return plainToInstance(UserEntity, findUser);
  }
}
