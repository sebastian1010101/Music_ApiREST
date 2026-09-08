import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from 'src/app.module';

type RegisteredUser = {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type Band = { id: string; name: string; formatYear: number };
type Track = { id: string; title: string; length: number; bandId: string };
type Playlist = {
  id: string;
  title: string;
  userId: string;
  tracks: Track[];
};

const primaryCredentials = {
  username: 'primary-user',
  email: 'primary@example.com',
  password: 'primary-password-123',
};

const secondaryCredentials = {
  username: 'secondary-user',
  email: 'secondary@example.com',
  password: 'secondary-password-123',
};

describe('approved API (e2e)', () => {
  let app: INestApplication;
  let primaryUser: RegisteredUser;
  let secondaryUser: RegisteredUser;
  let primaryToken: string;
  let secondaryToken: string;
  let band: Band;
  let track: Track;
  let playlist: Playlist;

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('users and authentication', () => {
    it('validates registration input', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          username: 'x',
          email: 'not-an-email',
          password: 'short',
          unexpected: true,
        })
        .expect(400);
    });

    it('registers users without exposing password data', async () => {
      const primaryResponse = await request(app.getHttpServer())
        .post('/users')
        .send(primaryCredentials)
        .expect(201);
      const secondaryResponse = await request(app.getHttpServer())
        .post('/users')
        .send(secondaryCredentials)
        .expect(201);

      primaryUser = primaryResponse.body as RegisteredUser;
      secondaryUser = secondaryResponse.body as RegisteredUser;

      for (const response of [primaryResponse, secondaryResponse]) {
        expect(response.body).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            username: expect.any(String),
            email: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        );
        expect(response.body).not.toHaveProperty('password');
      }
    });

    it('rejects invalid login credentials and logs in registered users', async () => {
      await request(app.getHttpServer())
        .post('/auth')
        .send({ email: primaryCredentials.email, password: 'wrong-password' })
        .expect(401);

      const primaryLogin = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: primaryCredentials.email,
          password: primaryCredentials.password,
        })
        .expect(200);
      const secondaryLogin = await request(app.getHttpServer())
        .post('/auth')
        .send({
          email: secondaryCredentials.email,
          password: secondaryCredentials.password,
        })
        .expect(200);

      primaryToken = primaryLogin.body.token as string;
      secondaryToken = secondaryLogin.body.token as string;
      expect(primaryToken).toEqual(expect.any(String));
      expect(secondaryToken).toEqual(expect.any(String));
    });

    it('protects user reads and serializes passwords out of responses', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
      await request(app.getHttpServer())
        .get(`/users/${primaryUser.id}`)
        .expect(401);

      const listResponse = await request(app.getHttpServer())
        .get('/users')
        .set(bearer(primaryToken))
        .expect(200);
      expect(listResponse.body).toHaveLength(2);
      expect(
        listResponse.body.every(
          (user: Record<string, unknown>) => !('password' in user),
        ),
      ).toBe(true);

      const oneResponse = await request(app.getHttpServer())
        .get(`/users/${primaryUser.id}`)
        .set(bearer(primaryToken))
        .expect(200);
      expect(oneResponse.body).toEqual(
        expect.objectContaining({
          id: primaryUser.id,
          email: primaryCredentials.email,
        }),
      );
      expect(oneResponse.body).not.toHaveProperty('password');
    });
  });

  describe('bands and tracks', () => {
    it('keeps reads public and writes protected', async () => {
      await request(app.getHttpServer()).get('/bands').expect(200, []);
      await request(app.getHttpServer()).get('/tracks').expect(200, []);

      await request(app.getHttpServer())
        .post('/bands')
        .send({ name: 'Unauthorized Band', formatYear: 2000 })
        .expect(401);
      await request(app.getHttpServer())
        .post('/tracks')
        .send({
          title: 'Unauthorized Track',
          length: 100,
          bandId: '05be8ad5-bc52-46b9-9cfa-476fef19fd1d',
        })
        .expect(401);
    });

    it('validates writes and creates bands and tracks with authentication', async () => {
      await request(app.getHttpServer())
        .post('/bands')
        .set(bearer(primaryToken))
        .send({ name: '', formatYear: -1, unexpected: true })
        .expect(400);

      const bandResponse = await request(app.getHttpServer())
        .post('/bands')
        .set(bearer(primaryToken))
        .send({ name: 'E2E Band', formatYear: 1999 })
        .expect(201);
      band = bandResponse.body as Band;

      await request(app.getHttpServer())
        .post('/tracks')
        .set(bearer(primaryToken))
        .send({ title: '', length: 0, bandId: 'invalid' })
        .expect(400);

      const trackResponse = await request(app.getHttpServer())
        .post('/tracks')
        .set(bearer(primaryToken))
        .send({ title: 'E2E Track', length: 245, bandId: band.id })
        .expect(201);
      track = trackResponse.body as Track;
    });

    it('allows public collection and item reads', async () => {
      const bands = await request(app.getHttpServer())
        .get('/bands')
        .expect(200);
      expect(bands.body).toContainEqual(
        expect.objectContaining({ id: band.id }),
      );
      await request(app.getHttpServer())
        .get(`/bands/${band.id}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expect.objectContaining({ id: band.id }));
        });

      const tracks = await request(app.getHttpServer())
        .get('/tracks')
        .expect(200);
      expect(tracks.body).toContainEqual(
        expect.objectContaining({ id: track.id }),
      );
      await request(app.getHttpServer())
        .get(`/tracks/${track.id}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(expect.objectContaining({ id: track.id }));
        });
      await request(app.getHttpServer()).get('/tracks/not-a-uuid').expect(400);
    });

    it('protects updates and deletes, and returns 204 without a body', async () => {
      await request(app.getHttpServer())
        .patch(`/bands/${band.id}`)
        .send({ name: 'Nope' })
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/bands/${band.id}`)
        .expect(401);
      await request(app.getHttpServer())
        .patch(`/tracks/${track.id}`)
        .send({ title: 'Nope' })
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/tracks/${track.id}`)
        .expect(401);

      const disposableBand = await request(app.getHttpServer())
        .post('/bands')
        .set(bearer(primaryToken))
        .send({ name: 'Disposable Band', formatYear: 2001 })
        .expect(201);
      const disposableTrack = await request(app.getHttpServer())
        .post('/tracks')
        .set(bearer(primaryToken))
        .send({
          title: 'Disposable Track',
          length: 123,
          bandId: disposableBand.body.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/bands/${band.id}`)
        .set(bearer(primaryToken))
        .send({ name: 'Updated E2E Band' })
        .expect(200);
      await request(app.getHttpServer())
        .patch(`/tracks/${track.id}`)
        .set(bearer(primaryToken))
        .send({ title: 'Updated E2E Track' })
        .expect(200);

      for (const path of [
        `/tracks/${disposableTrack.body.id}`,
        `/bands/${disposableBand.body.id}`,
      ]) {
        const response = await request(app.getHttpServer())
          .delete(path)
          .set(bearer(primaryToken))
          .expect(204);
        expect(response.text).toBe('');
      }
    });
  });

  describe('owner-scoped playlists', () => {
    it('requires authentication and validates playlist input', async () => {
      await request(app.getHttpServer()).get('/playlists').expect(401);
      await request(app.getHttpServer())
        .post('/playlists')
        .send({ title: 'Unauthorized' })
        .expect(401);
      await request(app.getHttpServer())
        .post('/playlists')
        .set(bearer(primaryToken))
        .send({ title: '', unexpected: true })
        .expect(400);
    });

    it('creates playlists and scopes collection reads to the owner', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/playlists')
        .set(bearer(primaryToken))
        .send({ title: 'Primary Playlist' })
        .expect(201);
      playlist = createResponse.body as Playlist;
      expect(playlist).toEqual(
        expect.objectContaining({
          title: 'Primary Playlist',
          userId: primaryUser.id,
          tracks: [],
        }),
      );

      await request(app.getHttpServer())
        .post('/playlists')
        .set(bearer(secondaryToken))
        .send({ title: 'Secondary Playlist' })
        .expect(201);

      const primaryList = await request(app.getHttpServer())
        .get('/playlists')
        .set(bearer(primaryToken))
        .expect(200);
      const secondaryList = await request(app.getHttpServer())
        .get('/playlists')
        .set(bearer(secondaryToken))
        .expect(200);

      expect(primaryList.body.map((item: Playlist) => item.userId)).toEqual([
        primaryUser.id,
      ]);
      expect(secondaryList.body.map((item: Playlist) => item.userId)).toEqual([
        secondaryUser.id,
      ]);
    });

    it('adds a track, patches the playlist, and reads the owned result', async () => {
      const addResponse = await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/tracks`)
        .set(bearer(primaryToken))
        .send({ trackId: track.id })
        .expect(201);
      expect(addResponse.body.tracks).toContainEqual(
        expect.objectContaining({ id: track.id }),
      );

      const duplicateResponse = await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/tracks`)
        .set(bearer(primaryToken))
        .send({ trackId: track.id })
        .expect(201);
      expect(
        duplicateResponse.body.tracks.filter(
          (playlistTrack: Track) => playlistTrack.id === track.id,
        ),
      ).toHaveLength(1);

      await request(app.getHttpServer())
        .post(`/playlists/${playlist.id}/tracks`)
        .set(bearer(primaryToken))
        .send({ trackId: 'not-a-uuid' })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/playlists/${playlist.id}`)
        .set(bearer(primaryToken))
        .send({ title: 'Updated Primary Playlist' })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toEqual(
            expect.objectContaining({
              id: playlist.id,
              title: 'Updated Primary Playlist',
            }),
          );
        });

      await request(app.getHttpServer())
        .get(`/playlists/${playlist.id}`)
        .set(bearer(primaryToken))
        .expect(200)
        .expect(({ body }) => {
          expect(body.tracks).toContainEqual(
            expect.objectContaining({ id: track.id }),
          );
        });
    });

    it('denies another user all access to an owned playlist', async () => {
      const attempts = [
        () =>
          request(app.getHttpServer())
            .get(`/playlists/${playlist.id}`)
            .set(bearer(secondaryToken)),
        () =>
          request(app.getHttpServer())
            .patch(`/playlists/${playlist.id}`)
            .set(bearer(secondaryToken))
            .send({ title: 'Hijacked' }),
        () =>
          request(app.getHttpServer())
            .post(`/playlists/${playlist.id}/tracks`)
            .set(bearer(secondaryToken))
            .send({ trackId: track.id }),
        () =>
          request(app.getHttpServer())
            .delete(`/playlists/${playlist.id}/tracks/${track.id}`)
            .set(bearer(secondaryToken)),
        () =>
          request(app.getHttpServer())
            .delete(`/playlists/${playlist.id}`)
            .set(bearer(secondaryToken)),
      ];

      for (const attempt of attempts) await attempt().expect(403);
    });

    it('removes tracks and deletes playlists with empty 204 responses', async () => {
      const removeResponse = await request(app.getHttpServer())
        .delete(`/playlists/${playlist.id}/tracks/${track.id}`)
        .set(bearer(primaryToken))
        .expect(204);
      expect(removeResponse.text).toBe('');

      await request(app.getHttpServer())
        .get(`/playlists/${playlist.id}`)
        .set(bearer(primaryToken))
        .expect(200)
        .expect(({ body }) => expect(body.tracks).toEqual([]));

      const deleteResponse = await request(app.getHttpServer())
        .delete(`/playlists/${playlist.id}`)
        .set(bearer(primaryToken))
        .expect(204);
      expect(deleteResponse.text).toBe('');

      await request(app.getHttpServer())
        .get(`/playlists/${playlist.id}`)
        .set(bearer(primaryToken))
        .expect(404);
    });
  });
});
