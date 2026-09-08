import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBandDto } from './dto/create-band.dto';
import { BandEntity } from './entities/band.entity';
import { plainToInstance } from 'class-transformer';
import { UpdateBandDto } from './dto/update-band.dto';

@Injectable()
export class BandServices {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateBandDto) {
    const createdBand = await this.prisma.bands.create({ data: body });
    return plainToInstance(BandEntity, createdBand);
  }

  async findAll() {
    const bands = await this.prisma.bands.findMany();
    return plainToInstance(BandEntity, bands);
  }

  async findOne(id: string) {
    const band = await this.prisma.bands.findUnique({ where: { id } });
    if (!band) throw new NotFoundException('Band id not found.');
    return plainToInstance(BandEntity, band);
  }

  async update(bandId: string, data: UpdateBandDto) {
    await this.findOne(bandId);
    const updatedBand = await this.prisma.bands.update({
      where: { id: bandId },
      data,
    });
    return plainToInstance(BandEntity, updatedBand);
  }

  async delete(bandId: string) {
    await this.findOne(bandId);
    await this.prisma.bands.delete({ where: { id: bandId } });
  }
}
