import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @ApiProperty({
    example: 'username@gmail.com',
    description: 'email of the user already created',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: '12345',
    description: 'password of user already created',
  })
  password: string;
}
