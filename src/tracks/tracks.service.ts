import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BandServices } from 'src/bands/bands.service';
import { TrackEntity } from './entities/track.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TracksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bandServices: BandServices,
  ) {}

  async create(body: CreateTrackDto) {
    await this.bandServices.findOne(body.bandId);

    const trackEntity = new TrackEntity(body);
    const createdTrack = await this.prisma.tracks.create({ data: trackEntity });
    return plainToInstance(TrackEntity, createdTrack);
  }

  async findAll() {
    return await this.prisma.tracks.findMany();
  }

  async findOne(trackId: string) {
    const findTrack = await this.prisma.tracks.findFirst({
      where: { id: trackId },
    });
    if (!findTrack) {
      throw new NotFoundException('Track not found.');
    }
    return findTrack;
  }

  async update(trackId: string, update: UpdateTrackDto) {
    await this.findOne(trackId);

    const newData = await this.prisma.tracks.update({
      where: { id: trackId },
      data: update,
    });
    return newData;
  }

  async delete(trackId: string) {
    const remove = await this.prisma.tracks.delete({
      where: { id: trackId },
    });
    if (!remove) {
      throw new NotFoundException('Track not found');
    }
    return remove;
  }
}
