/**
 * Turns raw blog entries into posts with every field filled in, so pages never
 * need to handle missing metadata.
 *
 *   title       frontmatter → first "# Heading" → file name
 *   date        frontmatter → "YYYY-MM-DD-" file name prefix → build error
 *   author      frontmatter → profile name
 *   description frontmatter → first paragraph of the post
 *   readingTime computed from the body
 *
 * Drafts (draft: true) show up in `npm run dev` but never in production builds.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';
import { profile } from './data';

export type BlogEntry = CollectionEntry<'blog'>;

export interface Post {
  entry: BlogEntry;
  slug: string;
  title: string;
  description: string;
  date: Date;
  updated?: Date;
  author: string;
  tags: string[];
  category?: string;
  draft: boolean;
  minutes: number;
  words: number;
  cover?: BlogEntry['data']['cover'];
  coverAlt?: string;
}

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})-/;

/** Strip Markdown syntax to get readable plain text. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~>#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(body: string): string {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim());
  const paragraph = blocks.find((b) => b && !/^(#|```|!\[|>|[-*+] |\d+\. |\||<|---)/.test(b)) ?? '';
  const text = toPlainText(paragraph);
  return text.length > 180 ? `${text.slice(0, 177).replace(/\s+\S*$/, '')}…` : text;
}

function titleFromFile(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function toPost(entry: BlogEntry): Post {
  const { data } = entry;
  const body = entry.body ?? '';
  const fileName = entry.id.split('/').pop() ?? entry.id;
  const datePrefix = fileName.match(DATE_PREFIX)?.[1];
  const slug = entry.id.replace(DATE_PREFIX, '').replace(/\/index$/, '');

  const date = data.date ?? (datePrefix ? new Date(`${datePrefix}T00:00:00Z`) : undefined);
  if (!date) {
    throw new Error(
      `Blog post "${entry.id}" has no date. Add "date: YYYY-MM-DD" to its frontmatter or name the file "YYYY-MM-DD-${fileName}.md".`,
    );
  }

  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const stats = readingTime(toPlainText(body));

  return {
    entry,
    slug,
    title: data.title ?? heading ?? titleFromFile(slug),
    description: data.description ?? firstParagraph(body),
    date,
    updated: data.updated,
    author: data.author ?? profile.name,
    tags: data.tags,
    category: data.category,
    draft: data.draft,
    minutes: Math.max(1, Math.round(stats.minutes)),
    words: stats.words,
    cover: data.cover,
    coverAlt: data.coverAlt,
  };
}

/** All visible posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.map(toPost).sort((a, b) => b.date.valueOf() - a.date.valueOf());
}

export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Tags with post counts, most used first. */
export function getTags(posts: Post[]): { name: string; slug: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const tag of posts.flatMap((p) => p.tags)) {
    const slug = tagSlug(tag);
    const current = counts.get(slug);
    counts.set(slug, { name: current?.name ?? tag, count: (current?.count ?? 0) + 1 });
  }
  return [...counts.entries()]
    .map(([slug, { name, count }]) => ({ name, slug, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function formatDate(date: Date, style: 'long' | 'short' = 'long'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
