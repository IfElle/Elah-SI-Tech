import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://elah.one',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
