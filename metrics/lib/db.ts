import { createClient, Client } from '@libsql/client';

let client: Client | null = null;
let schemaPromise: Promise<void> | null = null;

const getRequiredEnv = (key: 'TURSO_DATABASE_URL' | 'TURSO_AUTH_TOKEN'): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} environment variable is not set`);
  }
  return value;
};

const ensureClient = (): Client => {
  if (client) {
    return client;
  }

  client = createClient({
    url: getRequiredEnv('TURSO_DATABASE_URL'),
    authToken: getRequiredEnv('TURSO_AUTH_TOKEN'),
  });

  return client;
};

const ensureSchema = async (): Promise<void> => {
  const db = ensureClient();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS report_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usage_date TEXT NOT NULL,
      usage_time TEXT NOT NULL,
      expected_pension REAL NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      salary REAL NOT NULL,
      includes_sickness_periods INTEGER NOT NULL,
      zus_balance REAL NOT NULL,
      actual_pension REAL NOT NULL,
      adjusted_pension REAL NOT NULL,
      postal_code TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_report_events_usage_date ON report_events (usage_date);
  `);
};

schemaPromise = ensureSchema();

export const getDb = async (): Promise<Client> => {
  if (!schemaPromise) {
    schemaPromise = ensureSchema();
  }
  await schemaPromise;
  return ensureClient();
};
