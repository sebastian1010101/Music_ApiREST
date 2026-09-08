import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { BandsModule } from 'src/bands/bands.module';

@Module({
  controllers: [TracksController],
  providers: [TracksService],
  imports: [BandsModule],
  exports: [TracksService],
})
export class TracksModule {}
