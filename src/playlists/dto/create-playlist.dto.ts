import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;
}
