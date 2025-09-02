import { Provider } from './Provider.js';
import { YouTubeProvider } from './youtube.js';
import { InstagramProvider } from './instagram.js';
import { SoundCloudProvider } from './soundcloud.js';
import { TikTokProvider } from './tiktok.js';
import { HttpProvider } from './http.js';

export const providers: Provider[] = [
  new YouTubeProvider(),
  new InstagramProvider(),
  new SoundCloudProvider(),
  new TikTokProvider(),
  new HttpProvider()
];

export function pickProvider(url: string): { name: string, prov: Provider } | null {
  for (const p of providers) if (p.match(url)) return { name: p.constructor.name.replace('Provider','').toLowerCase(), prov: p };
  return null;
}
