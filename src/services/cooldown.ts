import { checkCooldown, recordCooldown } from '../db.js';
import { CONFIG } from '../config.js';

export async function ensureCooldown(tgId: number) {
  const ok = await checkCooldown(tgId, CONFIG.cooldownSeconds);
  if (!ok) return false;
  await recordCooldown(tgId);
  return true;
}
