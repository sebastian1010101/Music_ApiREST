import { NotFoundException } from '@nestjs/common';

jest.mock(
  'src/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
  { virtual: true },
);
jest.mock(
  'src/bands/bands.service',
  () => ({ BandServices: class BandServices {} }),
  { virtual: true },
);
jest.mock(
  'src/utils/base.id.entity',
  () => ({ BaseIDEntity: class BaseIDEntity {} }),
  { virtual: true },
);

import { TracksService } from './tracks.service';

describe('TracksService', () => {
  const track = {
    id: 'track-1',
    title: 'Teardrop',
    length: 330,
    bandId: 'band-1',
  };
  let prisma: {
    tracks: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let bands: { findOne: jest.Mock };
  let service: TracksService;

  beforeEach(() => {
    prisma = {
      tracks: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    bands = { findOne: jest.fn() };
    service = new TracksService(prisma as never, bands as never);
  });

  it('requires an existing band before creating a track', async () => {
    bands.findOne.mockResolvedValue({ id: track.bandId });
    prisma.tracks.create.mockResolvedValue(track);

    await expect(
      service.create({
        title: track.title,
        length: track.length,
        bandId: track.bandId,
      }),
    ).resolves.toEqual(expect.objectContaining(track));
    expect(bands.findOne).toHaveBeenCalledWith(track.bandId);
    expect(prisma.tracks.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: track.title,
        length: track.length,
        bandId: track.bandId,
      }),
    });
  });

  it('does not create a track for a missing band', async () => {
    bands.findOne.mockRejectedValue(new NotFoundException());

    await expect(
      service.create({ title: 'Unknown', length: 1, bandId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.tracks.create).not.toHaveBeenCalled();
  });

  it('lists tracks', async () => {
    prisma.tracks.findMany.mockResolvedValue([track]);

    await expect(service.findAll()).resolves.toEqual([track]);
  });

  it('throws when a track does not exist', async () => {
    prisma.tracks.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks existence before updating a track', async () => {
    prisma.tracks.findUnique.mockResolvedValue(track);
    prisma.tracks.update.mockResolvedValue({ ...track, title: 'Angel' });

    await expect(service.update(track.id, { title: 'Angel' })).resolves.toEqual(
      {
        ...track,
        title: 'Angel',
      },
    );
    expect(prisma.tracks.update).toHaveBeenCalledWith({
      where: { id: track.id },
      data: { title: 'Angel' },
    });
  });

  it('does not update a missing track', async () => {
    prisma.tracks.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing', { title: 'Angel' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.tracks.update).not.toHaveBeenCalled();
  });

  it('checks existence before deleting a track', async () => {
    prisma.tracks.findUnique.mockResolvedValue(track);
    prisma.tracks.delete.mockResolvedValue(track);

    await expect(service.delete(track.id)).resolves.toBeUndefined();
    expect(prisma.tracks.delete).toHaveBeenCalledWith({
      where: { id: track.id },
    });
  });

  it('does not delete a missing track', async () => {
    prisma.tracks.findUnique.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.tracks.delete).not.toHaveBeenCalled();
  });
});
