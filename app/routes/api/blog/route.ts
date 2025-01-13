import { type ActionFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'
import lunr from 'lunr'

import { index, published, all } from '~/db'

export async function loader() {
  const data = all.find(({ route }) => route === '/blog')
  return json(data)
}

export async function action({ request }: ActionFunctionArgs) {
  const { q, t, limit, offset } = z
    .object({
      q: z
        .string()
        .min(3)
        .transform((e) => e.replace(/[^a-zA-Z0-9]/g, ' '))
        .optional(),
      t: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    })
    .parse(await request.json())

  if (q) {
    const document = lunr.Index.load(index)
    const results = document.search(q)
    const data = results
      .filter(({ score }) => score >= 1)
      .map(({ ref }) => ref)
      .slice(offset, offset + limit)
    return json(data)
  }
  if (t) {
    const data = published
      .filter(({ tags }) => tags.includes(t))
      .map(({ route }) => route)
      .slice(offset, offset + limit)
    return json(data)
  }
  const { children: data = [] } =
    published.find(({ route }) => route === '/blog') || {}
  return json(data.slice(offset, offset + limit))
}
