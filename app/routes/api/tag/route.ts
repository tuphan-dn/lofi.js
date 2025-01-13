import { json } from '@remix-run/node'

import { all } from '~/db'

export async function loader() {
  const raw = all.map(({ tags }) => tags).flat()
  const tags = Object.entries(
    Object.fromEntries(raw.map((tag) => [tag, ''])),
  ).map(([e]) => e)
  return json(tags)
}
