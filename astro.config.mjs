import { defineConfig } from 'astro/config';

// Set SITE_URL to the final domain to enable canonical URLs and sitemap output.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'static',
  trailingSlash: 'always',
});
