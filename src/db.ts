import pkg from 'pg';
const { Pool } = pkg;
import { CONFIG } from './config.js';

export const pool = new Pool({
  connectionString: CONFIG.dbUrl,
  ssl: { rejectUnauthorized: false }
});


export async function upsertUser(tgId: number, username?: string) {
  const q = `insert into users (tg_id, username)
             values ($1, $2)
             on conflict (tg_id) do update set username = excluded.username
             returning id`;
  const { rows } = await pool.query(q, [tgId, username]);
  return rows[0].id as number;
}

export async function recordCooldown(tgId: number) {
  await pool.query(`insert into cooldowns (tg_id, last_action_at)
                    values ($1, now())
                    on conflict (tg_id) do update set last_action_at = now()`, [tgId]);
}

export async function checkCooldown(tgId: number, seconds: number) {
  const { rows } = await pool.query(`select extract(epoch from (now() - last_action_at)) as ago
                                     from cooldowns where tg_id=$1`, [tgId]);
  if (rows.length === 0) return true;
  return Number(rows[0].ago) >= seconds;
}

export async function incrementUsage(tgId: number) {
  await pool.query(`insert into usage_counters (tg_id, day, used)
                    values ($1, current_date, 1)
                    on conflict (tg_id, day) do update set used = usage_counters.used + 1`, [tgId]);
}
export async function getUsageToday(tgId: number) {
  const { rows } = await pool.query(`select used from usage_counters where tg_id=$1 and day=current_date`, [tgId]);
  return rows[0]?.used || 0;
}

export async function isBanned(tgId: number) {
  const { rows } = await pool.query(`select 1 from bans where tg_id=$1`, [tgId]);
  return rows.length > 0;
}

export async function banUser(tgId: number, reason?: string) {
  await pool.query(`insert into bans (tg_id, reason) values ($1,$2)
                    on conflict (tg_id) do update set reason=excluded.reason`, [tgId, reason||null]);
}

export async function unbanUser(tgId: number) {
  await pool.query(`delete from bans where tg_id=$1`, [tgId]);
}
