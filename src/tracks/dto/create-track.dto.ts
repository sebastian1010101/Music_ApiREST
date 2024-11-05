import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Required string, cant be empty',
  })
  title: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: 'Required int, positive int',
  })
  length: number;

  @IsUUID('4')
  @ApiProperty({
    description: 'bandId of the Track, uuid v4',
  })
  bandId: string;
}
