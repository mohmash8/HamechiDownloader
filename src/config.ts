export const CONFIG = {
  botToken: process.env.BOT_TOKEN!,
  dbUrl: process.env.DATABASE_URL!,
  baseUrl: process.env.BASE_URL!,
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET!,
  cooldownSeconds: parseInt(process.env.COOLDOWN_SECONDS || '20', 10),
  dailyQuota: parseInt(process.env.DAILY_QUOTA || '50', 10),
  adminIds: (process.env.ADMIN_IDS || '').split(',').map((s: string)=>s.trim()).filter(Boolean).map(Number),
  maxFileMB: 1900
};

if (!CONFIG.botToken || !CONFIG.dbUrl || !CONFIG.baseUrl || !CONFIG.webhookSecret) {
  throw new Error('Missing required envs');
}
