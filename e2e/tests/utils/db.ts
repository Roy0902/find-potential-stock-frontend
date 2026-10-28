import { Client } from 'pg';

const DEFAULT_URL = 'postgres://postgres:postgres@localhost:5432/find_potential_stock';

/**
 * Direct database access for arranging data in API-level tests.
 * Prefer the seeded data where possible; use this only to create
 * the state a scenario needs, and clean it up afterwards.
 */
export async function withDb<T>(work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: process.env.DATABASE_URL ?? DEFAULT_URL });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}
