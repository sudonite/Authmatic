import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'


// See https://wxt.dev/api/config.html
export default defineConfig({
  entrypointsDir: '../entrypoints',
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ['storage', 'downloads'],
  },
});
