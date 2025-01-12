import fs, { readFileSync, writeFileSync } from 'fs'
import { relative, resolve, parse, join } from 'path'
import { log } from 'isomorphic-git'
import { scanAsync, type Dree } from 'dree'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { select, selectAll } from 'unist-util-select'
import { toString } from 'mdast-util-to-string'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import toml from 'toml'
import { z } from 'zod'
import lunr from 'lunr'
import { isURL } from '~/lib/utils'

const inDir = 'app/routes/blog'
const outDir = 'app/db'

type ExtendedDree = Omit<Dree, 'children'> & {
  title: string
  image: string
  authors: string[]
  tags: string[]
  description: string
  content: string
  children?: ExtendedDree[]
  date: Date
}

type Tree = {
  route: string
  parent: string
  children: Tree[]
  title: string
  image: string
  authors: string[]
  tags: string[]
  description: string
  content: string
  date: Date
}

async function dreelize(root: string): Promise<ExtendedDree | null> {
  const dree = await scanAsync<ExtendedDree>(
    root,
    {
      size: false,
      sizeInBytes: false,
      hash: false,
      matches: '**/route.*',
      extensions: ['md', 'mdx'],
    },
    async (node) => {
      const file = readFileSync(node.path)
      const md = fromMarkdown(Uint8Array.from(file), {
        extensions: [frontmatter(['yaml', 'toml'])],
        mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])],
      })
      const matter = select('root > toml', md)
      const heading = select('root > heading', md) || {}
      const paragraph = select('root > paragraph', md) || {}
      const text = selectAll('heading, paragraph', md)
      const images = selectAll('image', md)
      const [image = ''] = images.map((image) => {
        try {
          const { url } = Object.assign({ url: '' }, image)
          if (isURL(url)) return url
          const { dir } = parse(node.relativePath)
          const { name, ext } = parse(url)
          const img = join(inDir, dir, `${name}${ext}`)
          const manifest: Record<string, { file: string; src: string }> =
            JSON.parse(readFileSync('build/.vite/server-manifest.json', 'utf8'))
          const out = Object.values(manifest).find(
            ({ src }) => !relative(src, img),
          )
          return out?.file || `/assets/${name}${ext}`
        } catch {
          return ''
        }
      })
      const commits = await log({
        fs,
        dir: './',
        filepath: relative('./', node.path),
        force: true,
        follow: true,
      })
      const authors = commits
        .map(({ commit: { author } }) => author.name)
        .filter((e, i, a) => a.indexOf(e) === i)
      const { tags, date } = z
        .object({
          tags: z
            .string()
            .default('')
            .transform((tags) =>
              tags
                .split(',')
                .map((e) => e.trim())
                .filter((e) => !!e),
            ),
          date: z.coerce.date().default(new Date()),
        })
        .parse(toml.parse(toString(matter)))
      node.title = toString(heading)
      node.image = image
      node.authors = authors
      node.tags = tags
      node.date = date
      node.description = toString(paragraph)
      node.content = text
        .map((e) => toString(e))
        .join(' ')
        .replaceAll('\n', ' ')
    },
  )
  return dree
}

function trielize(parent: string, { name, children = [] }: ExtendedDree): Tree {
  const route = `${parent}/${name}`
  const index = children.findIndex(({ type }) => type === 'file')
  const [
    only = {
      title: '',
      image: '',
      authors: [],
      tags: [],
      description: '',
      value: '',
      content: '',
      date: new Date(),
    },
  ] = index >= 0 ? children.splice(index, 1) : []
  return {
    route,
    parent,
    children: children
      .map((child) => trielize(route, child))
      .sort((a, b) => {
        if (a.date > b.date) return -1
        if (b.date > a.date) return 1
        if (a.title > b.title) return -1
        if (b.title > a.title) return 1
        return 0
      }),
    title: only.title,
    image: only.image,
    authors: only.authors,
    tags: only.tags,
    description: only.description,
    content: only.content || '',
    date: only.date,
  }
}

function flatten({ children = [], ...node }: Tree): Blog[] {
  return [
    { ...node, children: children.map(({ route }) => route) },
    ...children.map((child) => flatten(child)).flat(),
  ]
}

async function migrate() {
  // Parse data
  const root = resolve(process.cwd(), inDir)
  console.log('root', root)
  const dree = await dreelize(root)
  if (!dree) throw new Error('Empty contents')
  const tree = trielize('', dree)
  // Write table
  const table = flatten(tree)
  writeFileSync(join(outDir, 'table.json'), JSON.stringify(table, null, 2))
  // Write index
  const document = lunr(function () {
    this.ref('route')
    this.field('title')
    this.field('description')
    this.field('content')
    table.forEach((doc) => this.add(doc))
  })
  writeFileSync(join(outDir, 'index.json'), JSON.stringify(document, null, 2))
}
migrate()
