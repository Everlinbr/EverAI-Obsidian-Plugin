import { defineConfig } from 'esbuild';
import builtinModules from 'builtin-modules';

const isProd = process.argv[2] === 'production';

const config = defineConfig({
  banner: {
    js: '/*\nEverAI Obsidian Plugin\nOffline-first AI assistant for Obsidian on Android\n*/',
  },
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/autocomplete',
    '@codemirror/collab',
    '@codemirror/commands',
    '@codemirror/language',
    '@codemirror/lint',
    '@codemirror/search',
    '@codemirror/state',
    '@codemirror/view',
    '@lezer/common',
    '@lezer/highlight',
    '@lezer/lr',
  ],
  format: 'cjs',
  target: 'ES6',
  logLevel: 'info',
  sourcemap: isProd ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
});

if (!isProd) {
  config.watch = {
    onRebuild(error) {
      if (error) console.error('watch build failed:', error);
      else console.log('watch build succeeded');
    },
  };
}

export default config;
