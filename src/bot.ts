import { Context } from 'telegraf';
import { upsertUser, insertJob } from './db.js';
import { ensureCooldown } from './services/cooldown.js';
import { checkAndConsumeQuota } from './services/quota.js';
import { pickProvider } from './providers/index.js';
import { queue } from './queue.js';
import { CONFIG } from './config.js';

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[\w.-]+[^\s]*/i);
  return m ? m[0] : null;
}

export function registerBotHandlers(bot: any) {
  bot.start((ctx: Context) => ctx.reply('سلام! لینک بده، من برات به صورت **قانونی** متادیتا/دانلود مستقیم مجاز رو og می‌کنم. 😎'));
  bot.help((ctx: Context) => ctx.reply('فقط لینک بده. هاست‌های مجاز برای دانلود مستقیم در تنظیماته. YouTube/IG/SC فقط متادیتا.'));

  bot.command('me', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    // ساده: فقط سهمیه را نشان بده
    ctx.reply('برای دیدن سهمیه امروز، اول یک درخواست بفرست تا شمارش فعال شود ✌️');
  });

  bot.command('broadcast', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    const text = ctx.message?.text?.replace('/broadcast','').trim();
    if (!text) return ctx.reply('متن؟');
    await ctx.reply('ارسال همگانی راه افتاد ✅ (دموی ساده، انبوه‌فرست واقعی نیاز به پیاده‌سازی دارد)');
  });

  bot.on('text', async (ctx: Context) => {
    const chatId = ctx.chat.id;
    const tgId = ctx.from?.id!;
    const username = ctx.from?.username;
    const url = extractUrl((ctx.message as any).text || '');

    if (!url) return ctx.reply('یه لینک بفرست ✌️');

    const okCooldown = await ensureCooldown(tgId);
    if (!okCooldown) return ctx.reply('یه کم صبر کن، کول‌داون فعاله ⏳');

    const quota = await checkAndConsumeQuota(tgId);
    if (!quota.ok) return ctx.reply('سهمیهٔ امروزت تموم شد 😅 فردا دوباره بیا.');

    const userId = await upsertUser(tgId, username || undefined);

    const p = pickProvider(url);
    if (!p) return ctx.reply('فعلاً این لینک پشتیبانی نمی‌شود ❌');

    const jobId = await insertJob(userId, url, p.name);
    await queue.add('download', { chatId, url, provider: p.name, jobId });

    await ctx.reply(`اوکی ✅ صف پردازش: ${p.name} | باقی‌مونده امروز: ${quota.remaining}`);
  });
}
