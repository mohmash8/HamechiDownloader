# TG All‑in‑One Downloader — Railway Pro (Legal‑First, Webhook)

**هایپر نسخه** برای دیپلوی روی **Railway** با وبهوک تلگرام، صف BullMQ، Postgres، Redis، کول‌داون، کوتـا/سهمیه روزانه، تبلیغات، و سیستم پلاگینی Provider.

> ⚠️ **قانونی**: این پروژه هیچ‌جوره DRM/ToS رو دور نمی‌زنه. دانلود فقط وقتی که **مجاز** باشه (مثل لینک فایل مستقیم که مالکشی یا اجازه داری). YouTube/Instagram/SoundCloud = متادیتای قانونی (oEmbed)، نه ذخیرهٔ فایل بدون مجوز.

## Quick Start (Railway)

1) این ریپو رو به Railway وصل کن (Deploy from GitHub).  
2) داخل Railway → **Add PostgreSQL** و **Add Redis** (Plugins).  
3) متغیرهای محیطی رو ست کن (پایین).  
4) دامنه Railwayت رو تو `BASE_URL` بذار (HTTPS).  
5) Deploy کن؛ ربات خودش **Webhook** رو ست می‌کنه.  

### ENV لازم
- `BOT_TOKEN` ← از BotFather
- `DATABASE_URL` ← از PostgreSQL Plugin
- `REDIS_URL` ← از Redis Plugin
- `BASE_URL` ← دامنه عمومی HTTPS سرویس (مثلا `https://yourapp.up.railway.app`)
- `TELEGRAM_WEBHOOK_SECRET` ← یه رشتهٔ سخت تصادفی (برای مسیر امن وبهوک)
- `ALLOWED_FILE_HOSTS` ← دامین‌هایی که دانلود مستقیم براشون اوکیه، با کاما
- `COOLDOWN_SECONDS` ← پیش‌فرض 20
- `DAILY_QUOTA` ← تعداد دانلود/پردازش مجاز روزانه برای هر کاربر (مثلا 50)
- `MAX_FILE_MB` ← محدودیت سایز فایل (مثلا 1900)
- `ADMIN_IDS` ← لیست آیدی تلگرام ادمین‌ها، کاما جدا (اختیاری)

## محلی (اختیاری)
- `docker compose up -d` (PG+Redis)
- `cp .env.example .env` و مقدارها رو پر کن
- `npm i && npm run db:setup && npm run dev`

## دستورات ربات
- `/start` – خوشامد + راهنما
- `/help` – راهنما
- `/me` – سهمیهٔ باقیمانده و وضعیت
- لینک بده → صف میشه → خروجی قانونی (متادیتا یا فایل مستقیم)
- ادمین: `/broadcast ...` (برای ADMIN_IDS)

## ساختار
- `src/server.ts` – Fastify + وبهوک تلگرام + health
- `src/bot.ts` – هندلرهای Telegraf
- `src/queue.ts` – BullMQ Queue/Worker (همون پروسه)
- `src/providers/*` – Providerهای ماژولار
- `src/services/*` – کول‌داون، تبلیغات، سهمیه
- `src/db.ts` – Postgres Pool + کوئری‌ها
- `schema.sql` – جداول

## نکات
- فایل‌های مستقیم رو **استریم** می‌کنیم، نه ذخیرهٔ دائمی (برای دیپلوی ابری بهتره).
- oEmbed فقط عنوان/متادیتا میاره (قانونی).
- می‌خوای کاور/آرتیست/تایتل رو برای فایل‌های مجاز ست کنی؟ از `sendAudio` با متادیتا استفاده کن.

## آینده
- پرداخت/پریمیوم (Telegram Stars)
- صفحهٔ ادمین و گراف‌ها
- استوریج ابری (S3/R2) + پاکسازی
- چند Worker جداگانه (سرویس‌های مستقل در Railway)
