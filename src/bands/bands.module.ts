import { Module } from '@nestjs/common';
import { BandServices } from './bands.service';
import { BandsController } from './bands.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [BandsController],
  providers: [BandServices, PrismaService],
  // imports: [PrismaService],
})
export class BandsModule {}
