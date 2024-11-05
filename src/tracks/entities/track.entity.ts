import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID } from 'class-validator';
import { BaseIDEntity } from 'src/utils/base.id.entity';

export class TrackEntity extends BaseIDEntity {
  @ApiProperty({
    readOnly: true,
  })
  public declare readonly id: string;

  @IsString()
  @ApiProperty({
    example: 'My Track N1 ',
  })
  title: string;

  @IsInt()
  @ApiProperty({
    example: 200,
  })
  length: number;

  @IsUUID('4')
  @ApiProperty({
    example: '36e722e1-ade5-4a70-bee6-b80ff9c2a40c',
  })
  bandId: string;

  constructor(props: { title: string; length: number; bandId: string }) {
    super();
    Object.assign(this, props);
  }
}
