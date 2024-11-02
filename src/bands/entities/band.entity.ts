import { ApiProperty } from '@nestjs/swagger';
import { BaseIDEntity } from 'src/utils/base.id.entity';

export class BandEntity extends BaseIDEntity {
  @ApiProperty({
    example: '36e722e1-ade5-4a70-bee6-b80ff9c2a40c',
    description: 'Unique uuid (v4)',
  })
  public declare readonly id: string;

  @ApiProperty({
    example: 'my band name',
    description: 'the title of the band',
  })
  public name: string;

  @ApiProperty({
    example: 2006,
    description: 'year of the band foundation',
  })
  public formatYear: number;

  constructor(props: { name: string; formatYear: number }) {
    super();
    Object.assign(this, props);
  }
}
