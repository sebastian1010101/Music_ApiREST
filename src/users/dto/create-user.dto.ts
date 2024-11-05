import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @MinLength(2)
  @ApiProperty({
    example: 'my_username',
    description: 'Required string, max 50 chars , min 2 chars',
  })
  username: string;

  @IsEmail()
  @ApiProperty({
    example: 'username@gmail.com',
    description: 'Require a valid email',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(25)
  @ApiProperty({
    example: '12345',
    description: 'Required password, min 5 chars & max 25 chars',
  })
  password: string;
}
