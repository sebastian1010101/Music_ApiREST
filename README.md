# Music API REST

A REST API for managing bands, tracks, users, and personal playlists. It is built with NestJS, TypeScript, Prisma, SQLite, and JWT authentication.

## Features

- User registration and JWT login
- Public band and track reads
- Authenticated band and track writes
- Owner-scoped playlists
- DTO validation and unknown-field rejection
- Password hashing and response redaction
- Interactive OpenAPI documentation with Swagger
- Unit and end-to-end tests

## Requirements

- Node.js `>=22.12.0 <26`
- npm

## Installation

```bash
git clone <repository-url>
cd Music_ApiREST
npm ci
cp .env.example .env.local
```

Replace the placeholder JWT secret in `.env.local` with a long, random value:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
CORS_ORIGINS="http://localhost:5173"
```

`CORS_ORIGINS` accepts a comma-separated list of exact frontend origins, such as
`https://music.example.com,https://admin.example.com`.

Then prepare Prisma:

```bash
npx prisma generate
npx prisma migrate deploy
```

## Running the API

```bash
npm run start:dev
```

The API listens on `http://localhost:3000`. Swagger UI is available at `http://localhost:3000/api`.

For a production build:

```bash
npm run build
npm run start:prod
```

## Authentication

Protected endpoints require an access token in the request header:

```text
Authorization: Bearer <token>
```

Access tokens expire after one hour.

### Register a user

```http
POST /users
Content-Type: application/json

{
  "username": "listener",
  "email": "listener@example.com",
  "password": "correct-horse-battery-staple"
}
```

Passwords must contain between 12 and 72 UTF-8 bytes. Passwords and password hashes are never included in API responses.

### Log in

```http
POST /auth
Content-Type: application/json

{
  "email": "listener@example.com",
  "password": "correct-horse-battery-staple"
}
```

A successful login returns:

```json
{
  "token": "<jwt-access-token>"
}
```

## Endpoints

### Authentication and users

| Method | Route            | Authentication | Description                        |
| ------ | ---------------- | -------------- | ---------------------------------- |
| `POST` | `/users`         | Public         | Register a user                    |
| `POST` | `/auth`          | Public         | Log in and receive an access token |
| `GET`  | `/users`         | Required       | List users                         |
| `GET`  | `/users/:userId` | Required       | Get a user by UUID                 |

### Bands

| Method   | Route            | Authentication | Description                          |
| -------- | ---------------- | -------------- | ------------------------------------ |
| `GET`    | `/bands`         | Public         | List bands                           |
| `GET`    | `/bands/:id`     | Public         | Get a band by UUID                   |
| `POST`   | `/bands`         | Required       | Create a band                        |
| `PATCH`  | `/bands/:bandId` | Required       | Partially update a band              |
| `DELETE` | `/bands/:bandId` | Required       | Delete a band and its related tracks |

### Tracks

| Method   | Route              | Authentication | Description                         |
| -------- | ------------------ | -------------- | ----------------------------------- |
| `GET`    | `/tracks`          | Public         | List tracks                         |
| `GET`    | `/tracks/:trackId` | Public         | Get a track by UUID                 |
| `POST`   | `/tracks`          | Required       | Create a track for an existing band |
| `PATCH`  | `/tracks/:trackId` | Required       | Partially update a track            |
| `DELETE` | `/tracks/:trackId` | Required       | Delete a track                      |

### Playlists

All playlist routes require authentication. Collection reads return only playlists owned by the authenticated user, and detail or mutation routes reject access to another user's playlist.

| Method   | Route                                    | Description                             |
| -------- | ---------------------------------------- | --------------------------------------- |
| `GET`    | `/playlists`                             | List the authenticated user's playlists |
| `GET`    | `/playlists/:playlistId`                 | Get an owned playlist                   |
| `POST`   | `/playlists`                             | Create a playlist                       |
| `PATCH`  | `/playlists/:playlistId`                 | Partially update an owned playlist      |
| `DELETE` | `/playlists/:playlistId`                 | Delete an owned playlist                |
| `POST`   | `/playlists/:playlistId/tracks`          | Add a track to an owned playlist        |
| `DELETE` | `/playlists/:playlistId/tracks/:trackId` | Remove a track from an owned playlist   |

Successful delete operations return HTTP `204 No Content`.

## Data model

- A `Bands` record has many `Tracks`. Deleting a band cascades to its tracks.
- A `Tracks` record belongs to one band and can belong to many playlists.
- A `User` has many playlists.
- A `Playlists` record belongs to one user and can contain many tracks.

The Prisma schema is located at `prisma/schema.prisma`, and migrations are stored in `prisma/migrations`.

## Quality checks

```bash
npm run format:check
npm run lint:check
npm run typecheck
npm test -- --runInBand
npm run test:cov -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```

Unit tests are colocated with services under `src`. End-to-end tests use a uniquely named temporary SQLite database and do not modify `prisma/dev.db`.

To apply formatting or lint fixes locally:

```bash
npm run format
npm run lint
```

## Technology versions

The project uses NestJS 11, Prisma 7 with the `better-sqlite3` driver adapter, TypeScript 5.9, Jest 30, and ESLint 10 flat configuration. Package versions are declared in `package.json` and resolved reproducibly in `package-lock.json`.
