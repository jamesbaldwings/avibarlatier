// Single source of truth for site-wide data.
// Update links here once the channel and socials are live.

export const site = {
  name: 'Avi Barlatier',
  title: 'Avi Barlatier — Helping managers become leaders',
  url: 'https://avibarlatier.com',
  tagline: 'Helping managers become leaders for a new generation.',
  description:
    'Avi Barlatier helps people-leaders lead a new generation at work. Animated leadership lessons, a book, and practical frameworks for managers who were taught to manage but are now expected to lead.',
  author: 'Aviceen "Avi" Barlatier',
};

// Set these to live URLs when ready. Empty youtube = "launching soon" mode.
export const links = {
  youtube: 'https://www.youtube.com/@imavib', // channel URL
  youtubeHandle: 'imavib', // used to auto-pull latest videos via RSS (no API key)
  youtubeChannelId: 'UCHS2dtQMlNUxqUMD1LeiCfQ', // @imavib — skips handle resolution
  newsletter: 'https://www.humaneresources.news',
  // beehiiv embed: paste the src URL from your beehiiv embed <iframe>
  // (Dashboard → Settings → Subscribe Forms → Embed). Leave '' to fall back
  // to a button linking to the newsletter.
  beehiivEmbedUrl: '',
  book: '', // book buy/preorder link
  github: 'https://github.com/jamesbaldwings',
  linkedin: '', // placeholder
  email: 'hello@avibarlatier.com',
};

// Flip to true the moment videos are published. Controls subscribe-first vs newsletter-first.
export const channelLive = false;

export const nav = [
  { label: 'Watch', href: '/watch/' },
  { label: 'About', href: '/about/' },
  { label: 'Book', href: '/book/' },
  { label: 'Leadership', href: '/leadership/' },
  { label: 'Speaking', href: '/speaking/' },
  { label: 'More', href: '/more/' },
];

// Secondary pages, surfaced in footer + the "More" hub.
export const secondaryNav = [
  { label: 'Teaching', href: '/teaching/' },
  { label: 'Research', href: '/research/' },
  { label: 'Software', href: '/software/' },
  { label: 'Credentials', href: '/credentials/' },
  { label: 'Articles', href: '/articles/' },
  { label: 'Contact', href: '/contact/' },
];
