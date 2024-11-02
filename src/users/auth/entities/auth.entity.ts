import { compare } from 'bcrypt';
import { AuthDto } from '../dto/auth.dto';
import { UnauthorizedException } from '@nestjs/common';

export class LoginEntity {
  email: string;
  password: string;

  constructor(props: AuthDto) {
    Object.assign(this, props);
  }

  async comparePass(hashPassword: string) {
    const passwordMatch = await compare(this.password, hashPassword);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
  }
}
