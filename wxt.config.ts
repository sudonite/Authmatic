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
    name: 'Authmatic',
    description: 'A secure one-time password authenticator for Neptun.',
    version: '1.0.0',
    permissions: ['storage', 'downloads'],
  },
});
