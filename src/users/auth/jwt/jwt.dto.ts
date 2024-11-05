import { ApiProperty } from '@nestjs/swagger';

export class JwtAuthDto {
  @ApiProperty({
    example: '3e24234e-16bc-4294-8479-495172cee2d5',
    description: 'Id from user',
  })
  userId: string;

  @ApiProperty({
    example: 'username@gmail.com',
    description: 'email of user',
  })
  email: string;
}
