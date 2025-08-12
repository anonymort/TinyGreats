import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html'
      // strict stays default (true); fallback satisfies it
    }),
    alias: {
      '@': 'src',
      '$lib': 'src/lib'
    }
    // No global prerender entries — SPA fallback handles routes
  }
};

export default config;
