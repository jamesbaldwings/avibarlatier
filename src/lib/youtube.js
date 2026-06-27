// Fetch the latest uploads for a YouTube channel using only public endpoints
// (no API key). Flow:
//   1. Resolve the @handle to a channel ID (UC...) by scraping the channel page,
//      unless YT_CHANNEL_ID is provided (more robust — skips resolution).
//   2. Fetch the channel's RSS feed and parse out the recent videos.
// Results are cached in-process with a TTL. Any failure degrades gracefully to
// the last good cache, or an empty list, so the site never breaks on a YouTube
// hiccup or an empty/not-yet-created channel.

import { links } from '../data/site.js';

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const FETCH_TIMEOUT_MS = 6000;

let cache = { fetchedAt: 0, channelId: null, videos: [] };
let inflight = null;

const handle = (links.youtubeHandle || '').replace(/^@/, '');

async function fetchText(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; avibarlatier-site/1.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function resolveChannelId() {
  // Prefer an explicit channel ID (env or site.js) — robust, no scraping.
  if (process.env.YT_CHANNEL_ID) return process.env.YT_CHANNEL_ID;
  if (links.youtubeChannelId) return links.youtubeChannelId;
  if (!handle) return null;
  const html = await fetchText(`https://www.youtube.com/@${handle}`);
  const m =
    html.match(/"channelId":"(UC[\w-]+)"/) ||
    html.match(/"externalId":"(UC[\w-]+)"/) ||
    html.match(/channel\/(UC[\w-]+)/);
  return m ? m[1] : null;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function parseFeed(xml) {
  const entries = xml.split('<entry>').slice(1);
  const videos = [];
  for (const entry of entries) {
    const id = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    if (!id) continue;
    const title = decodeEntities(entry.match(/<title>([^<]*)<\/title>/)?.[1] || '');
    const description = decodeEntities(
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || ''
    ).trim();
    const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
    videos.push({
      id,
      title,
      description,
      published,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }
  return videos;
}

async function refresh() {
  const channelId = cache.channelId || (await resolveChannelId());
  if (!channelId) {
    cache = { fetchedAt: Date.now(), channelId: null, videos: [] };
    return cache;
  }
  const xml = await fetchText(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );
  cache = { fetchedAt: Date.now(), channelId, videos: parseFeed(xml) };
  return cache;
}

/**
 * Returns up to `limit` recent videos for the configured channel.
 * Never throws — returns [] (or the last good cache) on any error.
 */
export async function getChannelVideos(limit = 8) {
  const fresh = Date.now() - cache.fetchedAt < TTL_MS;
  if (fresh && cache.videos.length) return cache.videos.slice(0, limit);

  if (!inflight) {
    inflight = refresh()
      .catch((err) => {
        console.error('[youtube] fetch failed:', err?.message || err);
        return cache; // keep last good cache
      })
      .finally(() => {
        inflight = null;
      });
  }
  const result = await inflight;
  return (result.videos || []).slice(0, limit);
}
