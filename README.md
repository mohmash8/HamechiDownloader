# TG All‑in‑One Ultimate (Legal‑First)

Railway‑ready Telegram bot: webhook (Fastify), Telegraf, Postgres, BullMQ (with in‑memory fallback), cooldown, daily quota, ads, bans, admin commands, and modular providers:

- **YouTube / Instagram / SoundCloud / TikTok** → **metadata‑only** via oEmbed (no file saving).
- **HTTP(S) direct** → downloads only when legal (direct file URLs).

> ⚠️ No DRM/ToS bypass code. Add platform‑specific adapters **only** if compliant with their terms and your local law.

## ENV (define in Railway)
- `BOT_TOKEN`
- `DATABASE_URL`
- `BASE_URL` (e.g., `https://yourapp.up.railway.app`)
- `TELEGRAM_WEBHOOK_SECRET`
- `COOLDOWN_SECONDS` (e.g., 20)
- `DAILY_QUOTA` (e.g., 50)
- `ADMIN_IDS` (comma separated Telegram user IDs)
- Optional: `REDIS_URL` (if set → BullMQ; else in‑memory queue)

## Deploy
1. Add Postgres & (optional) Redis plugins on Railway.
2. Set ENVs above.
3. Run `schema.sql` once in DB (or copy/paste).
4. Deploy → webhook auto‑set to `BASE_URL/WEBHOOK_SECRET/telegram`.

## Commands
- `/start`, `/help`
- `/me` → quota info (simple)
- **Admin**: `/ban <id> [reason]`, `/unban <id>`, `/ads_add <text> [| <url>]`, `/ads_toggle <id> on|off`, `/broadcast <text>`

## Extend
- Add legal provider modules in `src/providers`.
- Add storage (S3/R2) in `src/services/storage.ts` (stub provided).
