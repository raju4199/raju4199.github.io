---
# Copy this file, rename it (e.g. my-new-post.md) and start writing.
# Files starting with "_" are ignored, so this template never shows up on the site.
#
# The file name becomes the URL: my-new-post.md → /blog/my-new-post/
# Tip: name it 2026-10-01-my-new-post.md and you can skip `date` below.

title: "Your post title"            # optional: falls back to the first "# heading", then the file name
description: "One or two sentences shown in listings, search results and link previews."  # optional: falls back to the first paragraph
date: 2026-10-01                     # required unless the file name starts with YYYY-MM-DD-
# updated: 2026-10-05                # optional: shows an "updated" date
tags: [Web Security, Write-up]       # each tag gets its own page at /blog/tags/<tag>/
# category: Research                 # optional label
# author: Raju Ranjan                # optional: defaults to the name in src/data/profile.yaml
# cover: ../../assets/blog/my-cover.png   # optional hero image (put it in src/assets/blog/)
# coverAlt: "Describe the cover image"
draft: true                          # true = visible in `npm run dev`, hidden on the live site
---

Start with an intro paragraph. It becomes the excerpt if you leave `description` empty.

## A section heading

Use `##` and `###` headings; they appear in the "On this page" table of contents.

```bash
echo "Code blocks get syntax highlighting and a copy button"
```

![Alt text for the image](../../assets/blog/xss-flow.svg)
