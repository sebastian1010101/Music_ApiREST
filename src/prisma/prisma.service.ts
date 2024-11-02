import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const prism = new PrismaClient({
  log: ['query'],
});
// prism.$on('query', (event) => {
//   console.log('Query:', event.query);
//   console.log('Params:', event.params);
//   console.log('Duration:', event.duration, 'ms');
// });

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query'],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$connect();
  }
}
