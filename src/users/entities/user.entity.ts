import { Exclude } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { BaseIDEntity } from 'src/utils/base.id.entity';
import { hash } from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity extends BaseIDEntity {
  @ApiProperty({
    example: '36e722e1-ade5-4a70-bee6-b80ff9c2a40c',
    description: 'Generate unique UUID v4',
    readOnly: true,
  })
  declare readonly id: string;

  @ApiProperty({
    example: 'my_username',
    description: 'the name of user',
  })
  username: string;

  @ApiProperty({
    example: 'username@gmail.com',
    description: 'email of the user',
  })
  email: string;

  @ApiProperty({
    example: '2024-10-30T02:11:17.668Z',
    description: 'Data of creation',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-10-30T02:11:17.668Z',
    description: 'Updated data of user',
  })
  updatedAt: Date;

  @Exclude()
  @ApiProperty({
    writeOnly: true,
  })
  password: string;

  constructor(props: CreateUserDto) {
    super();
    Object.assign(this, props);
  }

  async hashPassword() {
    this.password = await hash(this.password, 10);
  }
}
