import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { BandServices } from './bands.service';
import { UpdateBandDto } from './dto/update-band.dto';
import {
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { BandEntity } from './entities/band.entity';

@ApiTags('Bands')
@Controller('bands')
export class BandsController {
  constructor(private readonly bandService: BandServices) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: BandEntity,
  })
  async create(@Body() body: CreateBandDto) {
    return await this.bandService.create(body);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: BandEntity,
    isArray: true,
  })
  findAll() {
    return this.bandService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the band',
    example: '36e722e1-ae45-4a70-bee8-b88f19c2a40c',
  })
  @ApiResponse({
    status: 200,
    type: BandEntity,
  })
  async findById(@Param('id') id: string) {
    return await this.bandService.findOne(id);
  }

  @Patch(':bandId')
  @ApiBody({
    description: 'Set a new band value',
    type: PartialType(CreateBandDto),
  })
  @ApiResponse({
    status: 200,
    type: BandEntity,
    description: 'Update band values',
  })
  async update(@Param('bandId') bandId: string, @Body() data: UpdateBandDto) {
    return await this.bandService.update(bandId, data);
  }

  @Delete(':bandId')
  @ApiResponse({
    status: 204,
    description:
      'No content, NOTE: if you delete a band with related tracks they will also be deleted.',
  })
  async delete(@Param('bandId') bandId: string) {
    return await this.bandService.delete(bandId);
  }
}
