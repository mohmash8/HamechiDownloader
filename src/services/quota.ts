import { getUsageToday, incrementUsage } from '../db.js';
import { CONFIG } from '../config.js';

export async function checkAndConsumeQuota(tgId: number) {
  const used = await getUsageToday(tgId);
  if (used >= CONFIG.dailyQuota) return { ok: false, remaining: 0 };
  await incrementUsage(tgId);
  return { ok: true, remaining: CONFIG.dailyQuota - used - 1 };
}
