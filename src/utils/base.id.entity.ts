import { randomUUID } from 'crypto';

export class BaseIDEntity {
  public readonly id: string;

  constructor() {
    this.id = randomUUID();
  }
}
