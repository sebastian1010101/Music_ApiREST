import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { LoginEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(body: AuthDto) {
    const userEntity = new LoginEntity(body);

    const findEmail = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!findEmail) {
      throw new UnauthorizedException('Email not found');
    }

    await userEntity.comparePass(findEmail.password);

    return {
      token: await this.jwt.signAsync({
        sub: findEmail.id,
        email: findEmail.email,
      }),
    };
  }
}
