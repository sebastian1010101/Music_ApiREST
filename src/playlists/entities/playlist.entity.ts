import { ApiProperty } from '@nestjs/swagger';
import { BaseIDEntity } from 'src/utils/base.id.entity';

export class PlaylistEntity extends BaseIDEntity {
  @ApiProperty({
    readOnly: true,
  })
  declare readonly id: string;

  @ApiProperty({
    example: 'playlist 1st',
    description: 'title of playlist',
  })
  title: string;

  @ApiProperty({
    readOnly: true,
    example: '2024-11-02T21:46:02.505Z',
    description: 'data of playlist creation',
  })
  readonly createdAt: Date;

  @ApiProperty({
    readOnly: true,
    example: '2024-12-02T21:46:02.505Z',
    description: 'data of update',
  })
  readonly updatedAt: Date;

  @ApiProperty({
    example: '3e24234e-16bc-4294-8479-495172cee2d5',
    description: 'the corresponding user id',
  })
  userId: string;

  constructor(props: Partial<PlaylistEntity>) {
    super();
    Object.assign(this, props);
  }
}
