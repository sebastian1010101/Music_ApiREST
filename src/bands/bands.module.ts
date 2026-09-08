import { Module } from '@nestjs/common';
import { BandServices } from './bands.service';
import { BandsController } from './bands.controller';

@Module({
  controllers: [BandsController],
  providers: [BandServices],
  exports: [BandServices],
  // imports: [PrismaService],
})
export class BandsModule {}
