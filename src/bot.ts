import { Telegraf, Context } from 'telegraf';
import { CONFIG } from './config.js';
import { upsertUser, isBanned, checkCooldown, recordCooldown, getUsageToday, incrementUsage } from './db.js';
import axios from 'axios';
import { PassThrough } from 'stream';

export function createBot() {
  const bot = new Telegraf(CONFIG.botToken);

  bot.start((ctx: Context) => ctx.reply('سلام! لینک بده، من برات به صورت قانونی متادیتا/دانلود مستقیم مجاز رو og می‌کنم. 😎'));
  bot.help((ctx: Context) => ctx.reply('فقط لینک بده. HTTP مستقیم دانلود می‌شه، پلتفرم‌ها فعلاً متادیتا.'));

  bot.on('text', async (ctx: Context) => {
    const chatId = ctx.chat?.id; if (!chatId) return;
    const tgId = ctx.from?.id!;
    const username = ctx.from?.username;
    const text = (ctx.message as any).text || '';
    const m = text.match(/https?:\/\/[\w.-]+[^\s]*/i);
    if (!m) return ctx.reply('یه لینک بده ✌️');
    const url = m[0];

    if (await isBanned(tgId)) return ctx.reply('اکانت شما بن است.');

    const okCool = await checkCooldown(tgId, CONFIG.cooldownSeconds);
    if (!okCool) return ctx.reply('یه کم صبر کن، کول‌داون فعاله ⏳');
    await recordCooldown(tgId);

    const used = await getUsageToday(tgId);
    if (used >= CONFIG.dailyQuota) return ctx.reply('سهمیهٔ امروزت تموم شد 😅 فردا دوباره بیا.');
    await incrementUsage(tgId);

    await upsertUser(tgId, username || undefined);

    // Direct HTTP(S) download (legal)
    try {
      const head = await axios.head(url, { validateStatus: () => true });
      if (head.status >= 400) return ctx.reply(`URL در دسترس نیست (${head.status})`);
      const size = Number(head.headers['content-length'] || 0);
      if (size && size/1024/1024 > CONFIG.maxFileMB) return ctx.reply('فایل خیلی بزرگه');
      const res = await axios.get(url, { responseType: 'stream' });
      const stream = new PassThrough();
      res.data.pipe(stream);
      const filename = url.split('/').pop() || 'file';
      await ctx.replyWithDocument({ source: stream, filename });
    } catch (e) {
      await ctx.reply('دانلود نشد 😕');
    }
  });

  return bot;
}
