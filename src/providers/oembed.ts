import axios from 'axios';

export async function fetchOEmbed(inst: string, url: string) {
  const endpoints: Record<string, string> = {
    'soundcloud.com': 'https://soundcloud.com/oembed',
    'instagram.com': 'https://graph.facebook.com/v11.0/instagram_oembed',
    'www.instagram.com': 'https://graph.facebook.com/v11.0/instagram_oembed',
    'youtu.be': 'https://www.youtube.com/oembed',
    'youtube.com': 'https://www.youtube.com/oembed',
    'www.youtube.com': 'https://www.youtube.com/oembed',
    'tiktok.com': 'https://www.tiktok.com/oembed'
  };
  const ep = endpoints[inst] || endpoints[inst.replace(/^www\./,'')];
  if (!ep) throw new Error('oEmbed not configured for ' + inst);
  const { data } = await axios.get(ep, { params: { url } });
  return data;
}
