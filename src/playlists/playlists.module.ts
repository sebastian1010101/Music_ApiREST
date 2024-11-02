import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { TracksModule } from 'src/tracks/tracks.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  imports: [TracksModule, UsersModule],
})
export class PlaylistsModule {}
