import { Telegraf, Context } from 'telegraf';
import { CONFIG } from './config.js';
import { upsertUser, checkCooldown, touchCooldown, getUsageToday, incUsage } from './db.js';
import axios from 'axios';
import { PassThrough } from 'stream';

export function createBot() {
  const bot = new Telegraf(CONFIG.botToken);

  bot.start((ctx: Context) => ctx.reply('سلام! لینک بده، من برات به صورت قانونی دانلود مستقیم مجاز رو og می‌کنم. 😎'));
  bot.help((ctx: Context) => ctx.reply('فقط لینک بده. HTTP مستقیم دانلود می‌شه.'));

  bot.on('text', async (ctx: Context) => {
    const chatId = ctx.chat?.id; if (!chatId) return;
    const tgId = ctx.from?.id!;
    const username = ctx.from?.username;
    const text = (ctx.message as any).text || '';
    const m = text.match(/https?:\/\/[\w.-]+[^\s]*/i);
    if (!m) return ctx.reply('یه لینک بده ✌️');
    const url = m[0];

    // cooldown
    if (!(await checkCooldown(tgId, CONFIG.cooldownSeconds))) return ctx.reply('یه کم صبر کن، کول‌داون فعاله ⏳');
    await touchCooldown(tgId);

    // quota
    const used = await getUsageToday(tgId);
    if (used >= CONFIG.dailyQuota) return ctx.reply('سهمیهٔ امروزت تموم شد 😅');
    await incUsage(tgId);

    await upsertUser(tgId, username || undefined);

    // simple legal HTTP(S) download
    try {
      const head = await axios.head(url, { validateStatus: () => true });
      if (head.status >= 400) return ctx.reply(`URL در دسترس نیست (${head.status})`);
      const size = Number(head.headers['content-length'] || 0);
      if (size && size/1024/1024 > CONFIG.maxFileMB) return ctx.reply('فایل خیلی بزرگه');
      const res = await axios.get(url, { responseType: 'stream' });
      const stream = new PassThrough();
      res.data.pipe(stream);
      const nameFromUrl = url.split('/').pop() || 'file';
      await ctx.replyWithDocument({ source: stream, filename: nameFromUrl });
    } catch (e) {
      await ctx.reply('دانلود نشد 😕');
    }
  });

  return bot;
}
