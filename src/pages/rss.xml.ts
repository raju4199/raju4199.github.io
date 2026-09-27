import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '@/lib/data';
import { getPosts } from '@/lib/blog';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.title} · ${site.blog.title}`,
    description: site.blog.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: post.date,
      link: `/blog/${post.slug}/`,
      author: post.author,
      categories: post.tags,
    })),
    customData: `<language>${site.locale}</language>`,
  });
}
