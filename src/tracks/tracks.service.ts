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
    const createdTrack = await this.prisma.tracks.create({ data: body });
    return plainToInstance(TrackEntity, createdTrack);
  }

  async findAll() {
    const tracks = await this.prisma.tracks.findMany();
    return plainToInstance(TrackEntity, tracks);
  }

  async findOne(trackId: string) {
    const track = await this.prisma.tracks.findUnique({
      where: { id: trackId },
    });
    if (!track) throw new NotFoundException('Track not found.');
    return plainToInstance(TrackEntity, track);
  }

  async update(trackId: string, update: UpdateTrackDto) {
    await this.findOne(trackId);
    if (update.bandId) await this.bandServices.findOne(update.bandId);
    const updatedTrack = await this.prisma.tracks.update({
      where: { id: trackId },
      data: update,
    });
    return plainToInstance(TrackEntity, updatedTrack);
  }

  async delete(trackId: string) {
    await this.findOne(trackId);
    await this.prisma.tracks.delete({ where: { id: trackId } });
  }
}
