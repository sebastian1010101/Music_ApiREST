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
  ApiParam,
  ApiResponse,
  ApiTags,
  PartialType,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/users/auth/jwt/jwt.guard';
import { CreateBandDto } from './dto/create-band.dto';
import { BandServices } from './bands.service';
import { UpdateBandDto } from './dto/update-band.dto';
import { BandEntity } from './entities/band.entity';

@ApiTags('Bands')
@Controller('bands')
export class BandsController {
  constructor(private readonly bandService: BandServices) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, type: BandEntity })
  create(@Body() body: CreateBandDto) {
    return this.bandService.create(body);
  }

  @Get()
  @ApiResponse({ status: 200, type: BandEntity, isArray: true })
  findAll() {
    return this.bandService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'ID of the band',
    example: '36e722e1-ae45-4a70-bee8-b88f19c2a40c',
  })
  @ApiResponse({ status: 200, type: BandEntity })
  findById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.bandService.findOne(id);
  }

  @Patch(':bandId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: 'Set a new band value',
    type: PartialType(CreateBandDto),
  })
  @ApiResponse({
    status: 200,
    type: BandEntity,
    description: 'Update band values',
  })
  update(
    @Param('bandId', new ParseUUIDPipe({ version: '4' })) bandId: string,
    @Body() data: UpdateBandDto,
  ) {
    return this.bandService.update(bandId, data);
  }

  @Delete(':bandId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description:
      'No content, NOTE: if you delete a band with related tracks they will also be deleted.',
  })
  async delete(
    @Param('bandId', new ParseUUIDPipe({ version: '4' })) bandId: string,
  ) {
    await this.bandService.delete(bandId);
  }
}
