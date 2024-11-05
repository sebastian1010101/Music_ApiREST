import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateBandDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'The band number 1',
    description: 'Required String, cant be empty',
  })
  name: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({
    example: 2006,
    description: 'Required Int, positive numbers',
  })
  formatYear: number;
}
