import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const CONFIG = {
  botToken: required('BOT_TOKEN'),
  dbUrl: required('DATABASE_URL'),
  baseUrl: required('BASE_URL'),
  webhookSecret: required('TELEGRAM_WEBHOOK_SECRET'),
  cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS || '20', 10),
  dailyQuota: parseInt(process.env.DAILY_QUOTA || '50', 10),
  // Optional/implicit defaults:
  maxFileMB: 1900,
  allowedHosts: [] as string[],
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean).map(Number),
  redisUrl: process.env.REDIS_URL || ''
};
