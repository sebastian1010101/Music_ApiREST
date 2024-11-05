import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    description: 'creation of user',
    status: 201,
    type: UserEntity,
  })
  async create(@Body() body: CreateUserDto) {
    return await this.usersService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    isArray: true,
    description: 'return all users, token required',
  })
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':userId')
  @ApiResponse({
    status: 200,
    type: UserEntity,
    description: 'return the user with the corresponding Id',
  })
  async findById(@Param('userId') userId: string) {
    return await this.usersService.findById(userId);
  }
}
