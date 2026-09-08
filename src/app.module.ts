import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BandsModule } from './bands/bands.module';
import { PrismaModule } from './prisma/prisma.module';
import { TracksModule } from './tracks/tracks.module';
import { UsersModule } from './users/users.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: (config: Record<string, unknown>) => {
        for (const key of ['DATABASE_URL', 'JWT_SECRET']) {
          if (typeof config[key] !== 'string' || config[key].length === 0) {
            throw new Error(`${key} is required`);
          }
        }
        return config;
      },
    }),
    BandsModule,
    PrismaModule,
    TracksModule,
    UsersModule,
    PlaylistsModule,
  ],
})
export class AppModule {}
