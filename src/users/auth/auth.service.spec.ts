import { UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';

jest.mock('bcrypt', () => ({ compare: jest.fn() }));
jest.mock(
  'src/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
  { virtual: true },
);

import { AuthService } from './auth.service';

const mockedCompare = compare as jest.MockedFunction<typeof compare>;

describe('AuthService', () => {
  const credentials = {
    email: 'listener@example.com',
    password: 'plain-password',
  };
  const user = {
    id: 'user-1',
    username: 'listener',
    email: credentials.email,
    password: 'hashed-password',
  };
  let prisma: { user: { findUnique: jest.Mock } };
  let jwt: { signAsync: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = { user: { findUnique: jest.fn() } };
    jwt = { signAsync: jest.fn() };
    service = new AuthService(prisma as never, jwt as never);
  });

  it('compares the password and signs the expected token payload', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    mockedCompare.mockResolvedValue(true as never);
    jwt.signAsync.mockResolvedValue('signed-token');

    await expect(service.login(credentials)).resolves.toEqual({
      token: 'signed-token',
    });
    expect(mockedCompare).toHaveBeenCalledWith(
      credentials.password,
      user.password,
    );
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
  });

  it('uses the same generic unauthorized response for an unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const error = await service.login(credentials).catch((reason) => reason);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Invalid credentials');
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('uses the same generic unauthorized response for a wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    mockedCompare.mockResolvedValue(false as never);

    const error = await service.login(credentials).catch((reason) => reason);

    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Invalid credentials');
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
});
