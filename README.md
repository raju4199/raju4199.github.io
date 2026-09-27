# raju4199.github.io

Personal portfolio and blog of **Raju Ranjan**, covering offensive security, research and bug hunting.

Built with [Astro](https://astro.build), Tailwind CSS and [React Bits](https://reactbits.dev) components, and deployed to GitHub Pages on every push to `main`.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321 (drafts visible, search disabled)
npm run build      # production build + search index in dist/
npm run preview    # serve dist/ to test search and the final site
```

## Edit your content (no code needed)

Everything on the Home page comes from YAML files in [`src/data/`](src/data/). They are checked at build time, so a typo produces a clear error that names the file and the field.

| File | Controls |
| --- | --- |
| [`site.yaml`](src/data/site.yaml) | Site title, navigation, **which Home sections show and in what order**, section headings |
| [`profile.yaml`](src/data/profile.yaml) | Name, roles, tagline, photo, About text, stats, email and social links |
| [`skills.yaml`](src/data/skills.yaml) | Skill cards |
| [`timeline.yaml`](src/data/timeline.yaml) | Journey timeline (sorted by date automatically) |
| [`achievements.yaml`](src/data/achievements.yaml) | Certifications, hackathons, research, awards |
| [`projects.yaml`](src/data/projects.yaml) | Projects and write-ups |
| [`now.yaml`](src/data/now.yaml) | "Now", "Focus" and "What's next" |

- **Change the photo:** put the image in `src/assets/` and set `photo:` in `profile.yaml`.
- **Hide a section:** delete its line under `home:` in `site.yaml`.
- **Icons:** use any name from [Iconify](https://icon-sets.iconify.design) in the `lucide:*` or `simple-icons:*` sets.

## Write a blog post

1. Copy [`src/content/blog/_template.md`](src/content/blog/_template.md) to a new file, e.g. `src/content/blog/my-first-writeup.md`.
2. Fill in the frontmatter and write in Markdown.
3. Commit and push. The post appears on `/blog/`, gets its own page at `/blog/my-first-writeup/`, and is added to its tag pages, the RSS feed, the sitemap and search.

| Frontmatter | Required | If omitted |
| --- | --- | --- |
| `title` | no | first `# heading`, then the file name |
| `date` | yes* | taken from a `YYYY-MM-DD-` file name prefix |
| `description` | no | first paragraph of the post |
| `tags` | no | none |
| `author` | no | your name from `profile.yaml` |
| `updated`, `category`, `cover`, `coverAlt` | no | not shown |
| `draft` | no | `false`; `true` hides the post on the live site |

Reading time and word count are calculated automatically. Posts support GitHub-flavoured Markdown: tables, task lists, syntax-highlighted code blocks with copy buttons, images (store them in `src/assets/blog/` and link them relatively), and headings you can link to directly, which also feed the table of contents.

Files whose names start with `_` are ignored.

## Project layout

```text
src/
├── data/            ← your content (YAML)
├── content/blog/    ← blog posts (Markdown)
├── assets/          ← photo and blog images (optimized at build time)
├── components/
│   ├── home/        ← one component per Home section
│   ├── blog/        ← post cards, tags, search
│   ├── layout/      ← header, footer, SEO head, theme toggle
│   ├── react/       ← wrappers around React Bits components
│   └── reactbits/   ← React Bits source (installed via the shadcn CLI)
├── lib/             ← data loading/validation, blog helpers
├── pages/           ← routes: /, /blog, /blog/[slug], /blog/tags/[tag], /rss.xml
└── styles/          ← theme tokens (light/dark), typography, code blocks
```

### Adding more React Bits components

```bash
npx shadcn@latest add https://reactbits.dev/r/<Component>-TS-TW.json
```

The shadcn MCP server is configured in [`.mcp.json`](.mcp.json) for use with Claude Code.

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys the site on every push to `main`. One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.
