import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBandDto } from './dto/create-band.dto';
import { BandEntity } from './entities/band.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UpdateBandDto } from './dto/update-band.dto';
import { UUID } from 'crypto';

@Injectable()
export class BandServices {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: CreateBandDto) {
    const bandInstance = new BandEntity(body);

    const createBand = this.prisma.bands.create({
      data: bandInstance,
    });
    return plainToInstance(BandEntity, createBand);
  }

  async findAll() {
    return await this.prisma.bands.findMany();
  }

  async findOne(id: string) {
    const findId = await this.prisma.bands.findFirst({
      where: { id },
    });
    if (!findId) throw new NotFoundException('Band id not found.');
    return findId;
  }

  async update(bandId: string, data: UpdateBandDto) {
    await this.findOne(bandId);

    const update = await this.prisma.bands.update({
      where: { id: bandId },
      data,
    });
    return plainToInstance(BandEntity, update);
  }

  async delete(bandId: string) {
    const remove = await this.prisma.bands.delete({
      where: { id: bandId },
    });
    if (!remove) {
      throw new NotFoundException('bandId not found');
    }
  }
}
