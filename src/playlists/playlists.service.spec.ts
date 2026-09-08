import { jest } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';

jest.mock(
  'src/prisma/prisma.service',
  () => ({ PrismaService: class PrismaService {} }),
  { virtual: true },
);
jest.mock(
  'src/users/users.service',
  () => ({ UsersService: class UsersService {} }),
  { virtual: true },
);
jest.mock(
  'src/tracks/tracks.service',
  () => ({ TracksService: class TracksService {} }),
  { virtual: true },
);
jest.mock(
  'src/utils/base.id.entity',
  () => ({ BaseIDEntity: class BaseIDEntity {} }),
  { virtual: true },
);

import { PlaylistsService } from './playlists.service';
import { describe } from 'node:test';

interface CorrectedPlaylistsApi {
  findAll(user: { userId: string; email: string }): Promise<unknown>;
  findOne(
    playlistId: string,
    user: { userId: string; email: string },
  ): Promise<unknown>;
  update(
    playlistId: string,
    data: { title?: string },
    user: { userId: string; email: string },
  ): Promise<unknown>;
  delete(
    playlistId: string,
    user: { userId: string; email: string },
  ): Promise<unknown>;
  removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    user: { userId: string; email: string },
  ): Promise<unknown>;
}

describe('PlaylistsService owner scoping', () => {
  const owner = { userId: 'user-1', email: 'owner@example.com' };
  const stranger = { userId: 'user-2', email: 'other@example.com' };
  const playlist = {
    id: 'playlist-1',
    title: 'Trip hop',
    userId: owner.userId,
    tracks: [],
  };
  const track = {
    id: 'track-1',
    title: 'Roads',
    length: 307,
    bandId: 'band-1',
  };
  let prisma: {
    playlists: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let users: { findById: jest.Mock };
  let tracks: { findOne: jest.Mock };
  let service: PlaylistsService;
  let corrected: CorrectedPlaylistsApi;

  beforeEach(() => {
    prisma = {
      playlists: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    users = { findById: jest.fn() };
    tracks = { findOne: jest.fn() };
    service = new PlaylistsService(
      prisma as never,
      users as never,
      tracks as never,
    );
    corrected = service as unknown as CorrectedPlaylistsApi;
  });

  it('creates a playlist for the authenticated owner, ignoring client ownership', async () => {
    prisma.playlists.create.mockResolvedValue(playlist);

    await expect(
      service.create(
        { title: playlist.title, userId: stranger.userId } as never,
        owner,
      ),
    ).resolves.toEqual(playlist);
    expect(prisma.playlists.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: playlist.title,
        userId: owner.userId,
      }),
      include: { tracks: true },
    });
  });

  it('lists only playlists owned by the authenticated user', async () => {
    prisma.playlists.findMany.mockResolvedValue([playlist]);

    await expect(corrected.findAll(owner)).resolves.toEqual([playlist]);
    expect(prisma.playlists.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: owner.userId } }),
    );
  });

  it('returns an owned playlist detail', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(playlist);

    await expect(corrected.findOne(playlist.id, owner)).resolves.toEqual(
      playlist,
    );
  });

  it('does not expose another user playlist detail', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(null);

    await expect(
      corrected.findOne(playlist.id, stranger),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('adds an existing track only to an owned playlist', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(playlist);
    users.findById.mockResolvedValue({ id: owner.userId });
    tracks.findOne.mockResolvedValue(track);
    prisma.playlists.update.mockResolvedValue({ ...playlist, tracks: [track] });

    await expect(
      service.addTrackToPlaylist(playlist.id, { trackId: track.id }, owner),
    ).resolves.toEqual({ ...playlist, tracks: [track] });
    expect(tracks.findOne).toHaveBeenCalledWith(track.id);
    expect(prisma.playlists.update).toHaveBeenCalledWith({
      where: { id: playlist.id },
      data: { tracks: { connect: { id: track.id } } },
      include: { tracks: true },
    });
  });

  it('does not add a track to another user playlist', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    users.findById.mockResolvedValue({ id: stranger.userId });

    await expect(
      service.addTrackToPlaylist(playlist.id, { trackId: track.id }, stranger),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(tracks.findOne).not.toHaveBeenCalled();
    expect(prisma.playlists.update).not.toHaveBeenCalled();
  });

  it('updates only an owned playlist', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(playlist);
    prisma.playlists.update.mockResolvedValue({
      ...playlist,
      title: 'Favorites',
    });

    await expect(
      corrected.update(playlist.id, { title: 'Favorites' }, owner),
    ).resolves.toEqual({ ...playlist, title: 'Favorites' });
    expect(prisma.playlists.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: playlist.id },
        data: { title: 'Favorites' },
      }),
    );
  });

  it('deletes only an owned playlist', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(playlist);
    prisma.playlists.delete.mockResolvedValue(playlist);

    await expect(corrected.delete(playlist.id, owner)).resolves.toBeUndefined();
    expect(prisma.playlists.delete).toHaveBeenCalledWith({
      where: { id: playlist.id },
    });
  });

  it('removes a track only from an owned playlist', async () => {
    const playlistWithTrack = { ...playlist, tracks: [track] };
    prisma.playlists.findUnique.mockResolvedValue(playlistWithTrack);
    prisma.playlists.findFirst.mockResolvedValue(playlistWithTrack);
    tracks.findOne.mockResolvedValue(track);
    prisma.playlists.update.mockResolvedValue(playlist);

    await expect(
      corrected.removeTrackFromPlaylist(playlist.id, track.id, owner),
    ).resolves.toBeUndefined();
    expect(prisma.playlists.update).toHaveBeenCalledWith({
      where: { id: playlist.id },
      data: { tracks: { disconnect: { id: track.id } } },
    });
  });

  it('rejects update, delete, and remove for a non-owner without mutating', async () => {
    prisma.playlists.findUnique.mockResolvedValue(playlist);
    prisma.playlists.findFirst.mockResolvedValue(null);

    await expect(
      corrected.update(playlist.id, { title: 'Stolen' }, stranger),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      corrected.delete(playlist.id, stranger),
    ).rejects.toBeInstanceOf(Error);
    await expect(
      corrected.removeTrackFromPlaylist(playlist.id, track.id, stranger),
    ).rejects.toBeInstanceOf(Error);
    expect(prisma.playlists.update).not.toHaveBeenCalled();
    expect(prisma.playlists.delete).not.toHaveBeenCalled();
  });
});
