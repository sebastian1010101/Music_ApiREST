import { ApiProperty } from '@nestjs/swagger';

export class AuthEntity {
  @ApiProperty({
    description: 'Short-lived JWT access token',
  })
  token!: string;
}
