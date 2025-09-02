# TG All‑in‑One Downloader — Railway (Minimal ENV)

این نسخه فقط این متغیرها رو لازم داره:
- `BOT_TOKEN` (BotFather)
- `DATABASE_URL` (PostgreSQL)
- `BASE_URL` (دامنه HTTPS عمومی Railway)
- `TELEGRAM_WEBHOOK_SECRET` (مسیر امن وبهوک)
- `COOLDOWN_SECONDS` (مثلاً 20)
- `DAILY_QUOTA` (مثلاً 50)
- `ADMIN_IDS` (کاما جدا)

> صف: اگر `REDIS_URL` تنظیم نشده باشه، ربات از **صف درون‌حافظه‌ای** استفاده می‌کنه (برای یک سرویس تکی در Railway کافیه). اگر بعدها مقیاس دادی یا چند سرویس Worker جدا خواستی، فقط `REDIS_URL` رو اضافه کن.

## Quick Start
1) PostgreSQL رو به Railway اضافه کن و `DATABASE_URL` رو ست کن.
2) `BOT_TOKEN`, `BASE_URL`, `TELEGRAM_WEBHOOK_SECRET`, `COOLDOWN_SECONDS`, `DAILY_QUOTA`, `ADMIN_IDS` رو ست کن.
3) یک بار `schema.sql` رو روی دیتابیس اجرا کن (یا `npm run db:setup` لوکال).
4) Deploy → Webhook خودکار ست می‌شه.

## یادداشت قانونی
YouTube/Instagram/SoundCloud فقط متادیتا (oEmbed). دانلود مستقیم فقط برای لینک‌های فایل قانونی (HTTP Provider).
