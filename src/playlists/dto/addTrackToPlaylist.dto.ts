import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TrackToPlistDto {
  @IsUUID('4')
  @ApiProperty({
    example: '46bb940a-939e-4a8b-8f5f-839156642191',
    description: 'The corresponding trackID',
  })
  trackId: string;
}
