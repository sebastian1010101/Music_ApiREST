import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @IsInt()
  @IsPositive()
  formatYear: number;
}
