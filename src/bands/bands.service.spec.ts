import { jest } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';

jest.mock(
  'src/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
  { virtual: true },
);
jest.mock(
  'src/utils/base.id.entity',
  () => ({ BaseIDEntity: class BaseIDEntity {} }),
  { virtual: true },
);

import { BandServices } from './bands.service';

describe('BandServices', () => {
  const band = {
    id: 'band-1',
    name: 'Massive Attack',
    formatYear: 1988,
  };
  let prisma: {
    bands: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let service: BandServices;

  beforeEach(() => {
    prisma = {
      bands: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new BandServices(prisma as never);
  });

  it('creates and returns the persisted band', async () => {
    prisma.bands.create.mockResolvedValue(band);

    await expect(
      service.create({ name: band.name, formatYear: band.formatYear }),
    ).resolves.toEqual(expect.objectContaining(band));
    expect(prisma.bands.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: band.name,
        formatYear: band.formatYear,
      }),
    });
  });

  it('lists bands', async () => {
    prisma.bands.findMany.mockResolvedValue([band]);

    await expect(service.findAll()).resolves.toEqual([band]);
  });

  it('returns an existing band', async () => {
    prisma.bands.findUnique.mockResolvedValue(band);

    await expect(service.findOne(band.id)).resolves.toEqual(band);
    expect(prisma.bands.findUnique).toHaveBeenCalledWith({
      where: { id: band.id },
    });
  });

  it('throws when a band does not exist', async () => {
    prisma.bands.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('checks existence before updating a band', async () => {
    prisma.bands.findUnique.mockResolvedValue(band);
    prisma.bands.update.mockResolvedValue({ ...band, name: 'Portishead' });

    await expect(
      service.update(band.id, { name: 'Portishead' }),
    ).resolves.toEqual(expect.objectContaining({ name: 'Portishead' }));
    expect(prisma.bands.update).toHaveBeenCalledWith({
      where: { id: band.id },
      data: { name: 'Portishead' },
    });
  });

  it('does not update a missing band', async () => {
    prisma.bands.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing', { name: 'New name' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.bands.update).not.toHaveBeenCalled();
  });

  it('checks existence before deleting a band', async () => {
    prisma.bands.findUnique.mockResolvedValue(band);
    prisma.bands.delete.mockResolvedValue(band);

    await expect(service.delete(band.id)).resolves.toBeUndefined();
    expect(prisma.bands.delete).toHaveBeenCalledWith({
      where: { id: band.id },
    });
  });

  it('does not delete a missing band', async () => {
    prisma.bands.findUnique.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(prisma.bands.delete).not.toHaveBeenCalled();
  });
});
