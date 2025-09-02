import { Context } from 'telegraf';
import { upsertUser, isBanned, banUser, unbanUser } from './db.js';
import { ensureCooldown } from './services/cooldown.js';
import { checkAndConsumeQuota } from './services/quota.js';
import { addJob } from './queue.js';
import { CONFIG } from './config.js';
import { addAd, getActiveAd, toggleAd } from './services/ads.js';

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[\w.-]+[^\s]*/i);
  return m ? m[0] : null;
}

export function registerBotHandlers(bot: any) {
  bot.start((ctx: Context) => ctx.reply('سلام! لینک بده، من برات به صورت **قانونی** متادیتا/دانلود مستقیم مجاز رو og می‌کنم. 😎'));
  bot.help((ctx: Context) => ctx.reply('فقط لینک بده. HTTP مستقیم دانلود می‌شه، پلتفرم‌ها (YT/IG/SC/TT) فعلاً متادیتا.'));

  bot.on('text', async (ctx: Context) => {
    const chatId = ctx.chat.id;
    const tgId = ctx.from?.id!;
    const username = ctx.from?.username;
    const url = extractUrl((ctx.message as any).text || '');
    if (!url) return ctx.reply('یه لینک بفرست ✌️');

    if (await isBanned(tgId)) return ctx.reply('اکانت شما بن است.');

    const okCooldown = await ensureCooldown(tgId);
    if (!okCooldown) return ctx.reply('یه کم صبر کن، کول‌داون فعاله ⏳');

    const quota = await checkAndConsumeQuota(tgId);
    if (!quota.ok) return ctx.reply('سهمیهٔ امروزت تموم شد 😅 فردا دوباره بیا.');

    await upsertUser(tgId, username || undefined);

    await addJob({ chatId, url });
    await ctx.reply(`اوکی ✅ صف پردازش | باقی‌مونده امروز: ${quota.remaining}`);

    const ad = await getActiveAd();
    if (ad) await ctx.reply(`اسپانسر: ${ad.text}${ad.url ? '\n' + ad.url : ''}`);
  });

  // Admin commands
  bot.command('ban', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    const parts = (ctx.message as any).text.split(' ').slice(1);
    const id = Number(parts[0]); const reason = parts.slice(1).join(' ') || undefined;
    if (!id) return ctx.reply('ban <tgId> [reason]');
    await banUser(id, reason);
    ctx.reply('بن شد ✅');
  });

  bot.command('unban', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    const parts = (ctx.message as any).text.split(' ').slice(1);
    const id = Number(parts[0]);
    if (!id) return ctx.reply('unban <tgId>');
    await unbanUser(id);
    ctx.reply('آن‌بَن شد ✅');
  });

  bot.command('ads_add', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    const text = (ctx.message as any).text.replace('/ads_add','').trim();
    if (!text) return ctx.reply('ads_add <text> [| <url>]');
    const [t, u] = text.split('|').map(s => s.trim());
    await addAd(t, u || undefined);
    ctx.reply('تبلیغ اضافه شد ✅');
  });

  bot.command('ads_toggle', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    const parts = (ctx.message as any).text.split(' ').slice(1);
    const id = Number(parts[0]); const onoff = parts[1];
    if (!id || !onoff) return ctx.reply('ads_toggle <id> on|off');
    await toggleAd(id, onoff === 'on');
    ctx.reply('وضعیت تبلیغ تغییر کرد ✅');
  });

  bot.command('broadcast', async (ctx: Context) => {
    const tgId = ctx.from?.id!;
    if (!CONFIG.adminIds.includes(tgId)) return;
    ctx.reply('دموی برادکست: نیاز به پیاده‌سازی ارسال انبوه/صف جدا دارد.');
  });
}
