import { BaseIDEntity } from 'src/utils/base.id.entity';

export class BandEntity extends BaseIDEntity {
  public readonly id: string;

  public name: string;

  public formatYear: number;

  constructor(props: { name: string; formatYear: number }) {
    super();
    Object.assign(this, props);
  }
}
