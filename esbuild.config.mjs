import esbuild from 'esbuild';
import process from 'process';
import builtInModules from 'builtin-modules';

const banner =
`/*
EverAI Obsidian Plugin
Offline-first AI assistant for Obsidian
*/
`;

const prod = (process.argv[2] === 'production');
const context = await esbuild.context({
  banner: { js: banner },
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
    ...builtInModules,
  ],
  format: 'cjs',
  target: 'ES6',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
