import { Exclude } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { BaseIDEntity } from 'src/utils/base.id.entity';
import { hash } from 'bcrypt';

export class UserEntity extends BaseIDEntity {
  declare readonly id: string;

  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password: string;

  constructor(props: CreateUserDto) {
    super();
    Object.assign(this, props);
  }

  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
