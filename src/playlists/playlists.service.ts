import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { TracksService } from 'src/tracks/tracks.service';
import { JwtAuthDto } from 'src/users/auth/jwt/jwt.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly trackService: TracksService,
  ) {}

  async create(body: CreatePlaylistDto, user: JwtAuthDto) {
    await this.userService.findById(user.userId);
    return this.prisma.playlists.create({
      data: { ...body, userId: user.userId },
      include: { tracks: true },
    });
  }

  findAll(user: JwtAuthDto) {
    return this.prisma.playlists.findMany({
      where: { userId: user.userId },
      include: { tracks: true },
    });
  }

  async findOne(playlistId: string, user: JwtAuthDto) {
    const playlist = await this.prisma.playlists.findUnique({
      where: { id: playlistId },
      include: { tracks: true },
    });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== user.userId) {
      throw new ForbiddenException('You do not own this playlist');
    }
    return playlist;
  }

  async addTrackToPlaylist(
    playlistId: string,
    { trackId }: AddTrackToPlaylistDto,
    user: JwtAuthDto,
  ) {
    await this.findOne(playlistId, user);
    await this.trackService.findOne(trackId);
    return this.prisma.playlists.update({
      where: { id: playlistId },
      data: { tracks: { connect: { id: trackId } } },
      include: { tracks: true },
    });
  }

  async update(playlistId: string, body: UpdatePlaylistDto, user: JwtAuthDto) {
    await this.findOne(playlistId, user);
    return this.prisma.playlists.update({
      where: { id: playlistId },
      data: body,
      include: { tracks: true },
    });
  }

  async delete(playlistId: string, user: JwtAuthDto) {
    await this.findOne(playlistId, user);
    await this.prisma.playlists.delete({ where: { id: playlistId } });
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    user: JwtAuthDto,
  ) {
    const playlist = await this.findOne(playlistId, user);
    await this.trackService.findOne(trackId);
    if (!playlist.tracks.some((track) => track.id === trackId)) {
      throw new NotFoundException('Track is not in this playlist');
    }
    await this.prisma.playlists.update({
      where: { id: playlistId },
      data: { tracks: { disconnect: { id: trackId } } },
    });
  }
}
