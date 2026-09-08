import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [AuthModule],
  exports: [UsersService],
})
export class UsersModule {}
