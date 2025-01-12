import { type LoaderFunctionArgs, json } from '@remix-run/node'
import { z } from 'zod'

import { all } from '~/db'

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { '*': id } = z.object({ '*': z.string().default('') }).parse(params)
  const pathname = ['/blog', id].join('/')
  const data = all.find(({ route }) => route === pathname)
  return json(data)
}
