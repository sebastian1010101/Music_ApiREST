import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export default async function globalSetup(): Promise<void> {
  const databasePath = join(
    tmpdir(),
    `music-api-e2e-${process.pid}-${randomUUID()}.sqlite`,
  );

  process.env.MUSIC_API_E2E_DB_PATH = databasePath;
  process.env.DATABASE_URL = `file:${databasePath}`;
  process.env.JWT_SECRET = `e2e-secret-${randomUUID()}`;

  execFileSync(
    process.execPath,
    [
      require.resolve('prisma/build/index.js'),
      'db',
      'push',
      '--schema',
      join(process.cwd(), 'prisma/schema.prisma'),
    ],
    {
      env: process.env,
      stdio: 'pipe',
    },
  );
}
