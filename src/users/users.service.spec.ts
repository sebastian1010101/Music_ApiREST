import { ConflictException, NotFoundException } from '@nestjs/common';
import { hash } from 'bcrypt';
import { instanceToPlain } from 'class-transformer';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));
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

import { UsersService } from './users.service';

const mockedHash = hash as jest.MockedFunction<typeof hash>;

describe('UsersService', () => {
  const input = {
    username: 'listener',
    email: 'listener@example.com',
    password: 'plain-password',
  };
  const storedUser = {
    id: 'user-1',
    username: input.username,
    email: input.email,
    password: 'hashed-password',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new UsersService(prisma as never);
  });

  it('hashes a new user password before persistence and never returns it', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    mockedHash.mockResolvedValue('hashed-password' as never);
    prisma.user.create.mockResolvedValue(storedUser);

    const result = await service.create({ ...input });

    expect(mockedHash).toHaveBeenCalledWith(input.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        username: input.username,
        email: input.email,
        password: 'hashed-password',
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({ id: storedUser.id, email: storedUser.email }),
    );
    expect(instanceToPlain(result)).not.toHaveProperty('password');
  });

  it('rejects a duplicate email without hashing or creating', async () => {
    prisma.user.findUnique.mockResolvedValue(storedUser);

    await expect(service.create({ ...input })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(mockedHash).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('lists users without exposing password hashes', async () => {
    prisma.user.findMany.mockResolvedValue([storedUser]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({ id: storedUser.id, email: storedUser.email }),
    );
    expect(instanceToPlain(result[0])).not.toHaveProperty('password');
  });

  it('finds a user by id without exposing the password hash', async () => {
    prisma.user.findUnique.mockResolvedValue(storedUser);

    const result = await service.findById(storedUser.id);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: storedUser.id },
    });
    expect(instanceToPlain(result)).not.toHaveProperty('password');
  });

  it('throws when a user id does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
