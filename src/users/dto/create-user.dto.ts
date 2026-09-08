import { ApiProperty } from '@nestjs/swagger';
import {
  IsByteLength,
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
  username!: string;

  @IsEmail()
  @ApiProperty({
    example: 'username@gmail.com',
    description: 'Require a valid email',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @IsByteLength(12, 72)
  @ApiProperty({
    example: 'correct-horse-battery-staple',
    description: 'Required password, min 12 bytes and max 72 bytes',
  })
  password!: string;
}
