import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/users/auth/jwt/jwt.guard';
import { JwtAuthDto } from 'src/users/auth/jwt/jwt.dto';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackToPlaylistDto } from './dto/addTrackToPlaylist.dto';
import { PlaylistEntity } from './entities/playlist.entity';

type AuthenticatedRequest = Request & { user: JwtAuthDto };

@ApiTags('Playlists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: PlaylistEntity,
    description: 'Return the created playlist',
  })
  create(@Body() body: CreatePlaylistDto, @Req() req: AuthenticatedRequest) {
    return this.playlistsService.create(body, req.user);
  }

  @Get()
  @ApiResponse({
    status: 200,
    isArray: true,
    type: PlaylistEntity,
    description: 'Return playlists owned by the authenticated user',
  })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.playlistsService.findAll(req.user);
  }

  @Get(':playlistId')
  @ApiResponse({
    status: 200,
    type: PlaylistEntity,
    description: 'Return an owned playlist',
  })
  findById(
    @Param('playlistId', new ParseUUIDPipe({ version: '4' }))
    playlistId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playlistsService.findOne(playlistId, req.user);
  }

  @Post(':playlistId/tracks')
  @ApiResponse({
    status: 200,
    description: 'Return the playlist with the track added',
  })
  @ApiParam({
    name: 'playlistId',
    example: 'de095464-b244-4f1a-be0e-8a053e5b4bba',
    description: 'Playlist ID owned by the authenticated user',
  })
  addTracksToPlaylist(
    @Param('playlistId', new ParseUUIDPipe({ version: '4' }))
    playlistId: string,
    @Body() body: AddTrackToPlaylistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playlistsService.addTrackToPlaylist(playlistId, body, req.user);
  }

  @Patch(':playlistId')
  @ApiResponse({ status: 200, type: PlaylistEntity })
  update(
    @Param('playlistId', new ParseUUIDPipe({ version: '4' }))
    playlistId: string,
    @Body() body: UpdatePlaylistDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.playlistsService.update(playlistId, body, req.user);
  }

  @Delete(':playlistId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'No content' })
  async delete(
    @Param('playlistId', new ParseUUIDPipe({ version: '4' }))
    playlistId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.playlistsService.delete(playlistId, req.user);
  }

  @Delete(':playlistId/tracks/:trackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'No content' })
  async removeTrack(
    @Param('playlistId', new ParseUUIDPipe({ version: '4' }))
    playlistId: string,
    @Param('trackId', new ParseUUIDPipe({ version: '4' })) trackId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.playlistsService.removeTrackFromPlaylist(
      playlistId,
      trackId,
      req.user,
    );
  }
}
