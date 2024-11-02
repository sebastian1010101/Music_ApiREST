import { BaseIDEntity } from 'src/utils/base.id.entity';

export class PlaylistEntity extends BaseIDEntity {
  declare readonly id: string;
  title: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  userId: string;

  constructor(props: Partial<PlaylistEntity>) {
    super();
    Object.assign(this, props);
  }
}
