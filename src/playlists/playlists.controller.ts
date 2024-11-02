import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from 'src/users/auth/jwt/jwt.guard';
import { Request } from 'express';
import { JwtAuthDto } from 'src/users/auth/jwt/jwt.dto';
import { TrackToPlistDto } from './dto/addTrackToPlaylist.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreatePlaylistDto, @Req() req: Request) {
    console.log(req.user);
    return await this.playlistsService.create(body, req.user as JwtAuthDto);
  }

  @Get()
  async findAll() {
    return this.playlistsService.findAll();
  }

  @Get(':playlistId')
  async findById(@Param('playlistId') playlistId: string) {
    return await this.playlistsService.findOne(playlistId);
  }

  @Post(':playlistId/tracks')
  @UseGuards(JwtAuthGuard)
  async addTracksToPlaylist(
    @Param('playlistId') playlistId: string,
    @Body() body: TrackToPlistDto,
    @Req() req: Request,
  ) {
    return await this.playlistsService.addTrackToPlaylist(
      playlistId,
      body,
      req.user as JwtAuthDto,
    );
  }
}
