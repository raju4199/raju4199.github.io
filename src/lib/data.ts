/**
 * Loads the YAML files in src/data/, validates them, and exposes typed data.
 * A typo in a data file fails the build with a message naming the file and field.
 */
import { parse } from 'yaml';
import { z } from 'astro/zod';

import siteRaw from '@/data/site.yaml?raw';
import profileRaw from '@/data/profile.yaml?raw';
import skillsRaw from '@/data/skills.yaml?raw';
import timelineRaw from '@/data/timeline.yaml?raw';
import achievementsRaw from '@/data/achievements.yaml?raw';
import projectsRaw from '@/data/projects.yaml?raw';
import nowRaw from '@/data/now.yaml?raw';

const SECTIONS = [
  'hero', 'about', 'skills', 'journey', 'projects', 'achievements',
  'now', 'focus', 'next', 'blog', 'contact',
] as const;

const yearMonth = z
  .union([z.string(), z.number()])
  .transform(String)
  .refine((v) => /^\d{4}(-\d{2})?$/.test(v), 'Use "YYYY" or "YYYY-MM"');

const optionalUrl = z.string().optional().default('');

const siteSchema = z.object({
  title: z.string(),
  description: z.string(),
  locale: z.string().default('en'),
  nav: z.array(z.object({ label: z.string(), href: z.string() })),
  home: z.array(z.enum(SECTIONS)),
  sections: z
    .partialRecord(
      z.enum(SECTIONS),
      z.object({ label: z.string(), title: z.string(), intro: z.string().optional() }),
    )
    .default({}),
  blog: z.object({
    title: z.string().default('Blog'),
    description: z.string().default(''),
    homeCount: z.number().int().min(0).default(3),
  }),
  footer: z.object({ note: z.string().default('') }).default({ note: '' }),
});

const profileSchema = z.object({
  name: z.string(),
  handle: z.string(),
  roles: z.array(z.string()).min(1),
  location: z.string().optional(),
  photo: z.string(),
  status: z.string().optional(),
  tagline: z.string(),
  about: z.object({
    // Wrap words in **double asterisks** to highlight them.
    lede: z.string(),
    pillars: z
      .array(z.object({ icon: z.string().default('lucide:shield'), title: z.string(), text: z.string() }))
      .default([]),
    more: z.array(z.string()).default([]),
  }),
  stats: z
    .array(z.object({ value: z.number(), suffix: z.string().default(''), label: z.string() }))
    .default([]),
  contact: z.object({
    heading: z.string(),
    text: z.string(),
    email: z.string().optional().default(''),
    socials: z.array(
      z.object({
        label: z.string(),
        handle: z.string().optional().default(''),
        url: optionalUrl,
        icon: z.string(),
      }),
    ),
  }),
});

const skillsSchema = z.array(
  z.object({
    name: z.string(),
    icon: z.string(),
    description: z.string(),
    areas: z.array(z.string()).default([]),
    tools: z.array(z.string()).default([]),
  }),
);

const TIMELINE_TYPES = ['education', 'project', 'achievement', 'research', 'certification', 'work'] as const;

const timelineSchema = z.array(
  z.object({
    type: z.enum(TIMELINE_TYPES),
    start: yearMonth,
    end: z.union([yearMonth, z.literal('present')]).optional(),
    title: z.string(),
    org: z.string().optional(),
    logo: z.string().optional(),
    description: z.string().optional(),
    link: optionalUrl,
  }),
);

const achievementsSchema = z.array(
  z.object({
    icon: z.string().default('🏆'),
    title: z.string(),
    event: z.string(),
    result: z.string().optional(),
    year: z.number().int().optional(),
    category: z.enum(['certification', 'hackathon', 'research', 'award']),
    link: optionalUrl,
  }),
);

const projectsSchema = z.array(
  z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(['shipped', 'in-progress', 'coming-soon']).default('shipped'),
    links: z
      .object({ github: optionalUrl, demo: optionalUrl, writeup: optionalUrl })
      .default({ github: '', demo: '', writeup: '' }),
  }),
);

const nowItem = z.object({ icon: z.string().default('lucide:circle'), title: z.string(), text: z.string() });

const nowSchema = z.object({
  updated: z.coerce.date().optional(),
  now: z.array(nowItem).default([]),
  focus: z.array(nowItem).default([]),
  next: z
    .array(
      z.object({
        title: z.string(),
        text: z.string(),
        status: z.enum(['planned', 'in-progress', 'done']).default('planned'),
      }),
    )
    .default([]),
});

function load<S extends z.ZodType>(schema: S, raw: string, file: string): z.output<S> {
  const result = schema.safeParse(parse(raw));
  if (!result.success) {
    throw new Error(`Invalid data in src/data/${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const site = load(siteSchema, siteRaw, 'site.yaml');
export const profile = load(profileSchema, profileRaw, 'profile.yaml');
export const skills = load(skillsSchema, skillsRaw, 'skills.yaml');
export const projects = load(projectsSchema, projectsRaw, 'projects.yaml');
export const now = load(nowSchema, nowRaw, 'now.yaml');

export const timeline = load(timelineSchema, timelineRaw, 'timeline.yaml')
  .map((entry, index) => ({ ...entry, index }))
  // Oldest first; ties keep file order.
  .sort((a, b) => a.start.localeCompare(b.start) || a.index - b.index);

export const achievements = load(achievementsSchema, achievementsRaw, 'achievements.yaml')
  .map((entry, index) => ({ ...entry, index }))
  // Newest first; undated entries go first so awards without a year aren't buried.
  .sort((a, b) => (b.year ?? 9999) - (a.year ?? 9999) || a.index - b.index);

export type Section = (typeof SECTIONS)[number];
export type TimelineType = (typeof TIMELINE_TYPES)[number];

/** "2024-03" → "Mar 2024", "2024" → "2024". */
export function formatYearMonth(value: string): string {
  const [year, month] = value.split('-');
  if (!month) return year;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatRange(start: string, end?: string): string {
  if (!end) return formatYearMonth(start);
  return `${formatYearMonth(start)} — ${end === 'present' ? 'Present' : formatYearMonth(end)}`;
}
