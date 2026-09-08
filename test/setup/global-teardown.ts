import { rm } from 'node:fs/promises';

export default async function globalTeardown(): Promise<void> {
  const databasePath = process.env.MUSIC_API_E2E_DB_PATH;
  if (!databasePath) return;

  await Promise.all(
    ['', '-journal', '-shm', '-wal'].map((suffix) =>
      rm(`${databasePath}${suffix}`, { force: true }),
    ),
  );
}
