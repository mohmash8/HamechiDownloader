import { pool } from '../db.js';

export async function getActiveAd(): Promise<{text: string, url?: string} | null> {
  const { rows } = await pool.query(`select text, url from ads where is_active=true order by random() limit 1`);
  return rows[0] || null;
}
