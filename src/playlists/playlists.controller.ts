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
import { JwtAuthGuard } from 'src/users/auth/jwt/jwt.guard';
import { Request } from 'express';
import { JwtAuthDto } from 'src/users/auth/jwt/jwt.dto';
import { TrackToPlistDto } from './dto/addTrackToPlaylist.dto';
import { ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PlaylistEntity } from './entities/playlist.entity';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    type: PlaylistEntity,
    description: 'return of the playlist creation',
  })
  async create(@Body() body: CreatePlaylistDto, @Req() req: Request) {
    console.log(req.user);
    return await this.playlistsService.create(body, req.user as JwtAuthDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    isArray: true,
    description: 'return of all playlists',
  })
  async findAll() {
    return this.playlistsService.findAll();
  }

  @Get(':playlistId')
  @ApiResponse({
    status: 200,
    type: PlaylistEntity,
    description: 'return the corresponding playlist id',
  })
  async findById(@Param('playlistId') playlistId: string) {
    return await this.playlistsService.findOne(playlistId);
  }

  @Post(':playlistId/tracks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'return of the playlist with the tracks added',
  })
  @ApiParam({
    name: 'playlistId',
    example: 'de095464-b244-4f1a-be0e-8a053e5b4bba',
    description: 'playlistId from the corresponding user',
  })
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
