import { json } from '@remix-run/node'

export function loader() {
  throw json('Not Found', { status: 404 })
}

export function action() {
  throw json('Not Found', { status: 404 })
}
