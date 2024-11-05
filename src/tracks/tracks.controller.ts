import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ApiBody, ApiResponse, PartialType } from '@nestjs/swagger';
import { TrackEntity } from './entities/track.entity';

@Controller('tracks')
export class TracksController {
  constructor(private readonly trackService: TracksService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: TrackEntity,
    description: 'create a track body',
  })
  async create(@Body() body: CreateTrackDto) {
    return await this.trackService.create(body);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: TrackEntity,
    isArray: true,
    description: 'Return all tracks',
  })
  async findAll() {
    return await this.trackService.findAll();
  }

  @Get(':trackId')
  @ApiResponse({
    status: 200,
    type: TrackEntity,
    description: 'Return track by Id',
  })
  async findOne(@Param('trackId') trackId: string) {
    return await this.trackService.findOne(trackId);
  }

  @Patch(':trackId')
  @ApiBody({
    description: 'Update a track value',
    type: PartialType(CreateTrackDto),
  })
  @ApiResponse({
    status: 200,
    type: TrackEntity,
  })
  async update(
    @Param('trackId') trackId: string,
    @Body() body: UpdateTrackDto,
  ) {
    return await this.trackService.update(trackId, body);
  }

  @Delete(':trackId')
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  async delete(@Param('trackId') trackId: string) {
    return await this.trackService.delete(trackId);
  }
}
