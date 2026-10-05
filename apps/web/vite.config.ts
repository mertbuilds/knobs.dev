import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { cloudflare } from '@cloudflare/vite-plugin';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { unplugin as stylex } from '@stylexjs/unplugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin, searchForWorkspaceRoot } from 'vite';

const repoRoot = resolve(import.meta.dirname, '../..');

// The dev server runs devknobs from its local checkout, so the site tests the
// version in the works: DEVKNOBS_PATH (absolute, or relative to the repo root),
// else `devknobs` beside this checkout, which also holds for `knobs.dev.<branch>`
// worktrees. Builds keep the pinned npm package.
function localDevknobs(): Plugin {
  const wanted = resolve(repoRoot, process.env.DEVKNOBS_PATH ?? '../devknobs');
  const root = existsSync(resolve(wanted, 'src/index.ts')) ? realpathSync(wanted) : null;
  return {
    apply: 'serve',
    config() {
      if (!root) {
        return;
      }
      return {
        resolve: { alias: [{ find: /^devknobs$/, replacement: resolve(root, 'src/index.ts') }] },
        server: { fs: { allow: [searchForWorkspaceRoot(process.cwd()), root] } },
      };
    },
    configResolved({ logger }) {
      if (root) {
        logger.info(`devknobs: local ${root}`);
        return;
      }
      const { version } = JSON.parse(
        readFileSync(resolve(import.meta.dirname, 'node_modules/devknobs/package.json'), 'utf8'),
      ) as { version: string };
      logger.info(`devknobs: npm ${version} (no local checkout at ${wanted})`);
    },
    configureServer(server) {
      if (!root) {
        return;
      }
      // The source asks for its device images beside src/engine, where the
      // build copies them; in the checkout they sit in assets/bezels.
      const from = `/@fs${root}/src/engine/bezels/`;
      server.middlewares.use((req, _res, next) => {
        if (req.url?.startsWith(from)) {
          req.url = `/@fs${root}/assets/bezels/${req.url.slice(from.length)}`;
        }
        next();
      });
    },
    name: 'local-devknobs',
  };
}

export default defineConfig({
  plugins: [
    localDevknobs(),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    react({ compiler: true }),
    // debug:false — StyleX's dev `data-style-src` attribute embeds file:line, and the
    // React Compiler (client-only) shifts line numbers vs the SSR transform, causing a
    // hydration attribute mismatch that detaches React's event tree (dead forms).
    stylex.vite({ debug: false, useCSSLayers: true }),
    paraglideVitePlugin({
      cookieName: 'PARAGLIDE_LOCALE',
      outdir: './src/paraglide',
      project: './project.inlang',
      strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
    }),
  ],
  server: {
    // Vite ignores PORT by default; portless assigns one when proxying https://knobs.localhost.
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
  },
});
