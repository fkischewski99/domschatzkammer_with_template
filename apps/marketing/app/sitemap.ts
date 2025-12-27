import fs from 'fs/promises';
import path from 'path';
import { allDocs, allPosts } from 'content-collections';

import { env } from '~/env';
import { routing } from '~/src/i18n/routing';

type SitemapEntry = {
  url: string;
  lastModified: Date | string;
  changeFreq?: string;
  priority?: number;
};

async function getPages(baseUrl: string): Promise<SitemapEntry[]> {
  const marketingPath = path.join(process.cwd(), 'app');
  const entries = await fs.readdir(marketingPath, { withFileTypes: true });
  const routes: SitemapEntry[] = [];

  for (const entry of entries.filter((e) => e.isDirectory())) {
    // Check for page.tsx in the directory
    try {
      const fullPath = path.join(marketingPath, entry.name);
      const pageStats = await fs.stat(path.join(fullPath, 'page.tsx'));
      const route = entry.name === 'home' ? '' : entry.name;

      routes.push({
        url: `${baseUrl}/${route}`,
        lastModified: pageStats.mtime,
        priority: route === '' ? 1.0 : 0.8,
        changeFreq: 'weekly'
      });
    } catch {
      // No page.tsx found, skip this directory
      continue;
    }
  }

  return routes;
}

export default async function Sitemap(): Promise<SitemapEntry[]> {
  const baseUrl = env.NEXT_PUBLIC_MARKETING_URL;

  const sitemap: SitemapEntry[] = [];

  // Generate entries for each locale
  for (const locale of routing.locales) {
    // Homepage
    sitemap.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      priority: 1,
      changeFreq: 'weekly'
    });

    // Docs
    allDocs.forEach((doc) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${doc.slug}`,
        lastModified: new Date(),
        priority: 0.8,
        changeFreq: 'weekly'
      });
    });

    // Blog posts
    allPosts.forEach((post) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${post.slug}`,
        lastModified: post.published,
        priority: 0.6,
        changeFreq: 'monthly'
      });
    });

    // Static pages
    const staticPages = [
      '/blog',
      '/careers',
      '/contact',
      '/cookie-policy',
      '/pricing',
      '/privacy-policy',
      '/story',
      '/terms-of-use'
    ];

    staticPages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        priority: 0.7,
        changeFreq: 'weekly'
      });
    });
  }

  // Sort alphabetically by URL
  return sitemap.sort((a, b) => a.url.localeCompare(b.url));
}
