import { IsUUID } from 'class-validator';

export class TrackToPlistDto {
  @IsUUID('4')
  trackId: string;
}
