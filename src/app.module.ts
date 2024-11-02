import { Module } from '@nestjs/common';

import { BandsModule } from './bands/bands.module';
import { PrismaModule } from './prisma/prisma.module';
import { TracksModule } from './tracks/tracks.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    BandsModule,
    PrismaModule,
    TracksModule,
    UsersModule,
    PlaylistsModule,
  ],
})
export class AppModule {}
