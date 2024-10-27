import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBandDto } from './dto/create-band.dto';
import { BandEntity } from './entities/band.entity';

@Injectable()
export class BandServices {
  constructor(private readonly prisma: PrismaService) {}

  public async create(body: CreateBandDto) {
    const band = new BandEntity(body);
    const createBand = await this.prisma.bands.create({ data: body });
    return createBand;
  }
}
