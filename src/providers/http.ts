import { Provider, ProcessResult } from './Provider.js';
import { CONFIG } from '../config.js';
import axios from '@fastify/axios';
import { PassThrough } from 'stream';
import { URL } from 'url';

/** Direct HTTP(s) file download if allowed host + size checks. */
export class HttpProvider implements Provider {
  match(urlStr: string) {
    try { new URL(urlStr); return /^https?:\/\//i.test(urlStr); } catch { return false; }
  }
  async process(urlStr: string): Promise<ProcessResult> {
    const u = new URL(urlStr);
    if (CONFIG.allowedHosts.length && !CONFIG.allowedHosts.includes(u.hostname)) {
      return { mode: 'metadata', title: `دانلود مستقیم از ${u.hostname} مجاز نیست`, originalUrl: urlStr };
    }

    const head = await axios.head(urlStr, { validateStatus: () => true });
    if (head.status >= 400) {
      return { mode: 'metadata', title: `URL در دسترس نیست (${head.status})`, originalUrl: urlStr };
    }
    const size = Number(head.headers['content-length'] || 0);
    const mb = size / (1024*1024);
    if (size && mb > CONFIG.maxFileMB) {
      return { mode: 'metadata', title: `حجم فایل ${mb.toFixed(1)}MB از سقف مجاز بیشتره`, originalUrl: urlStr };
    }

    const res = await axios.get(urlStr, { responseType: 'stream' });
    const stream = new PassThrough();
    res.data.pipe(stream);
    const disp = head.headers['content-disposition'] as string | undefined;
    let filename = 'file';
    if (disp) {
      const m = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disp);
      filename = decodeURIComponent((m?.[1] || m?.[2] || filename));
    } else {
      const path = u.pathname.split('/').filter(Boolean);
      const last = path[path.length-1];
      if (last) filename = last;
    }
    const mime = head.headers['content-type'] as string | undefined;
    return { mode: 'file', filename, stream, sizeBytes: size || undefined, mime };
  }
}
