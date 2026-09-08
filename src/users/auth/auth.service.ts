import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(body: AuthDto): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    const passwordMatches = user
      ? await compare(body.password, user.password)
      : false;
    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: await this.jwt.signAsync({ sub: user.id, email: user.email }),
    };
  }
}
