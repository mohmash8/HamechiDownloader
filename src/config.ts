import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const CONFIG = {
  botToken: required('BOT_TOKEN'),
  dbUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  baseUrl: required('BASE_URL'),
  webhookSecret: required('TELEGRAM_WEBHOOK_SECRET'),
  cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS || '20', 10),
  dailyQuota: parseInt(process.env.DAILY_QUOTA || '50', 10),
  maxFileMB: parseInt(process.env.MAX_FILE_MB || '1900', 10),
  allowedHosts: (process.env.ALLOWED_FILE_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean),
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean).map(Number)
};
