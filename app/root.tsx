import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import type { LinksFunction, MetaFunction } from '@remix-run/node'

import styles from '~/styles/global.css?url'

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
  },
  {
    rel: 'stylesheet',
    href: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/tokyo-night-dark.min.css',
  },
  {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css',
    integrity:
      'sha384-wcIxkf4k558AjM3Yz3BBFQUbk/zgIYC2R0QpeeYb+TwlBVMrlgLqwRjRtGZiK7ww',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: styles,
  },
]

export const meta: MetaFunction = () => {
  return [
    { title: 'tuphan.dev' },
    {
      name: 'description',
      content:
        "I usually write about Computer Science like Web3, WebDev, Cryptography, Math, and also some MBA stuff cause I'm learning it.",
    },
    {
      name: 'host',
      content: 'https://tuphan.dev/',
    },
  ]
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function Root() {
  return <Outlet />
}
