import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ params }: LoaderFunctionArgs) {
  const { '*': id } = params
  return `about:${id}`
}

export default function Page() {
  const id = useLoaderData<typeof loader>()
  return <p>{id}</p>
}
