import { pool } from '../db.js';

export async function getActiveAd(): Promise<{text: string, url?: string} | null> {
  const { rows } = await pool.query(`select id, text, url from ads where is_active=true order by random() limit 1`);
  if (!rows.length) return null;
  return { text: rows[0].text, url: rows[0].url || undefined };
}

export async function addAd(text: string, url?: string) {
  await pool.query(`insert into ads (text, url, is_active) values ($1,$2,true)`, [text, url||null]);
}

export async function toggleAd(id: number, on: boolean) {
  await pool.query(`update ads set is_active=$1 where id=$2`, [on, id]);
}
