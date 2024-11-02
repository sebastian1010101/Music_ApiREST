import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { TracksService } from 'src/tracks/tracks.service';
import { JwtAuthDto } from 'src/users/auth/jwt/jwt.dto';
import { PlaylistEntity } from './entities/playlist.entity';
import { TrackToPlistDto } from './dto/addTrackToPlaylist.dto';

@Injectable()
export class PlaylistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly trackService: TracksService,
  ) {}

  async create(body: CreatePlaylistDto, user: JwtAuthDto) {
    const data = new PlaylistEntity({ ...body, userId: user.userId });
    const createPlaylist = await this.prisma.playlists.create({ data });
    return createPlaylist;
  }

  async findAll() {
    return await this.prisma.playlists.findMany();
  }

  async findOne(playlistId: string) {
    const findPlaylist = await this.prisma.playlists.findUnique({
      where: { id: playlistId },
    });

    if (!findPlaylist) {
      throw new NotFoundException('playlist not found');
    }
    return findPlaylist;
  }

  async addTrackToPlaylist(
    playlistId: string,
    { trackId }: TrackToPlistDto,
    user: JwtAuthDto,
  ) {
    const playlistExists = await this.findOne(playlistId);
    await this.userService.findById(user.userId);

    if (playlistExists.userId !== user.userId) {
      throw new ForbiddenException('Not permission');
    }

    await this.trackService.findOne(trackId);

    const updatePlaylist = await this.prisma.playlists.update({
      where: { id: playlistId },
      data: {
        tracks: {
          connect: { id: trackId },
        },
      },
      include: { tracks: true },
    });

    return updatePlaylist;
  }
}
