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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/users/auth/jwt/jwt.guard';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { TrackEntity } from './entities/track.entity';

@ApiTags('Tracks')
@Controller('tracks')
export class TracksController {
  constructor(private readonly trackService: TracksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    type: TrackEntity,
    description: 'Create a track',
  })
  create(@Body() body: CreateTrackDto) {
    return this.trackService.create(body);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: TrackEntity,
    isArray: true,
    description: 'Return all tracks',
  })
  findAll() {
    return this.trackService.findAll();
  }

  @Get(':trackId')
  @ApiResponse({
    status: 200,
    type: TrackEntity,
    description: 'Return track by ID',
  })
  findOne(
    @Param('trackId', new ParseUUIDPipe({ version: '4' })) trackId: string,
  ) {
    return this.trackService.findOne(trackId);
  }

  @Patch(':trackId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Update a track value',
    type: PartialType(CreateTrackDto),
  })
  @ApiResponse({ status: 200, type: TrackEntity })
  update(
    @Param('trackId', new ParseUUIDPipe({ version: '4' })) trackId: string,
    @Body() body: UpdateTrackDto,
  ) {
    return this.trackService.update(trackId, body);
  }

  @Delete(':trackId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'No content' })
  async delete(
    @Param('trackId', new ParseUUIDPipe({ version: '4' })) trackId: string,
  ) {
    await this.trackService.delete(trackId);
  }
}
