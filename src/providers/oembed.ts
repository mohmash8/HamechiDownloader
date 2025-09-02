import axios from '@fastify/axios';

export async function fetchOEmbed(inst: string, url: string) {
  const endpoints: Record<string, string> = {
    'soundcloud.com': 'https://soundcloud.com/oembed',
    'instagram.com': 'https://graph.facebook.com/v11.0/instagram_oembed',
    'www.instagram.com': 'https://graph.facebook.com/v11.0/instagram_oembed',
    'youtu.be': 'https://www.youtube.com/oembed',
    'youtube.com': 'https://www.youtube.com/oembed',
    'www.youtube.com': 'https://www.youtube.com/oembed'
  };
  const ep = endpoints[inst];
  if (!ep) throw new Error('oEmbed not configured for ' + inst);
  const { data } = await axios.get(ep, { params: { url } });
  return data;
}
