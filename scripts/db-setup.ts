import { Client } from 'pg';
import 'dotenv/config';
import fs from 'fs';

async function main() {
  const sql = fs.readFileSync('schema.sql', 'utf-8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log('DB schema applied.');
}

main().catch((e) => { console.error(e); process.exit(1); });
