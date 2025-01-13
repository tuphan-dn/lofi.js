import { vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { keccak_256 } from '@noble/hashes/sha3'
import bs58 from 'bs58'

// Deep Route
import { type Dree, scan, Type } from 'dree'
import { minimatch } from 'minimatch'
import { join } from 'path'
import type {
  DefineRouteFunction,
  RouteManifest,
} from '@remix-run/dev/dist/config/routes'

// Markdown
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeMdxImportMedia from 'rehype-mdx-import-media'
import rehypeToc from '@jsdevtools/rehype-toc'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { rehypeExtendedHighlight } from '@gears-bot/rehype'
import { all } from 'lowlight'
// @ts-expect-error: highlightjs-solidity doesn't support typescript
import { solidity } from 'highlightjs-solidity'
import rehypeMermaid from 'rehype-mermaid'

declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true
  }
}

function deepRoutes(
  defineRoutes: (
    callback: (defineRoute: DefineRouteFunction) => void,
  ) => RouteManifest,
  routeDir = './routes',
) {
  return defineRoutes((route) => {
    const dree = scan(join('./app', routeDir), {
      matches: '**/{layout,route}.*',
      extensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    })

    function wrap(wrapper: string, name: string, active: boolean) {
      if (!active) return wrapper
      if (!wrapper) return name
      return `${wrapper}/${name}`
    }

    function parse(
      { name, type, relativePath, children = [] }: Dree,
      wrapper = '',
    ): () => void {
      if (type === Type.DIRECTORY) {
        const index = children.findIndex((child) =>
          minimatch(child.name, 'layout.*'),
        )
        const nextWrapper = wrap(wrapper, name, relativePath !== '.')
        if (index < 0)
          return () =>
            children
              .map((child) => parse(child, nextWrapper))
              .forEach((subroute) => subroute())
        const [layout] = children.splice(index, 1)
        return () =>
          route(nextWrapper, join(routeDir, layout.relativePath), () =>
            children
              .map((child) => parse(child, ''))
              .forEach((subroute) => subroute()),
          )
      }
      return () => route(wrapper, join(routeDir, relativePath), { index: true })
    }
    parse(dree)()
  })
}

export default defineConfig({
  plugins: [
    mdx({
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [
        remarkGfm,
        remarkMath,
        [remarkFrontmatter, ['yaml', 'toml']],
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeToc,
        rehypeKatex,
        [
          rehypeExtendedHighlight,
          { tabsName: 'Tabs', tabName: 'Tab', languages: { ...all, solidity } },
        ],
        [rehypeAutolinkHeadings, { behavior: 'append' }],
        [rehypeMermaid, { strategy: 'pre-mermaid' }],
        [rehypeMdxImportMedia, { elementAttributeNameCase: 'html' }],
      ],
    }),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
      ignoredRouteFiles: ['**/*'],
      routes: (defineRoutes) => deepRoutes(defineRoutes, 'routes'),
    }),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ['react-use', '@egjs/react-view360'],
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames({ source }) {
          const hash = bs58.encode(keccak_256(source))
          return `assets/[name].${hash.slice(0, 8)}[extname]`
        },
      },
    },
  },
})
