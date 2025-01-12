import clsx from 'clsx'

import { Link, Outlet, useLocation } from '@remix-run/react'
import { MDXProvider } from '@mdx-js/react'
import { ExternalLink } from 'lucide-react'

import Anchor from '~/components/md/anchor'
import Image from '~/components/md/image'
import Toc from '~/components/md/toc'
import Pre, { Tabs, Tab } from '~/components/md/highlight'
import { BlogCard, useBlog } from '~/components/blog'

const components = {
  a: Anchor,
  img: Image,
  pre: Pre,
  nav: Toc,
  Tabs,
  Tab,
}

export default function Layout() {
  const { pathname } = useLocation()

  const {
    data: {
      route = '',
      // date,
      // authors = [],
      // tags = [],
      parent,
      children: routes = [],
    } = {},
  } = useBlog(pathname)

  const { data: { children: siblings = [] } = {} } = useBlog(parent)
  const { data: { route: prev = '', title: left = '←' } = {} } = useBlog(
    siblings[siblings.findIndex((e) => e === route) + 1] ||
      (parent !== '/blog' ? parent : '/404'),
  )
  const { data: { route: next = '', title: right = '→' } = {} } = useBlog(
    routes.at(-1) || siblings[siblings.findIndex((e) => e === route) - 1],
  )

  return (
    <div className="w-full flex flex-row justify-center">
      <div className="w-full max-w-a4 p-6">
        <div className="w-full flex flex-col gap-4 items-center relative">
          <article className="w-full mb-16 prose prose-h1:mt-[1.6666667em] prose-p:tracking-[-.25px] prose-table:w-full prose-table:block prose-table:overflow-auto">
            <MDXProvider components={components}>
              <Outlet />
            </MDXProvider>
          </article>
          <div
            id="question"
            className="w-full bg-base-200 border-2 border-base-300 p-4 rounded-box flex flex-col gap-1"
          >
            <p className="font-bold">You have questions?</p>
            <p>
              <span className="opacity-60">Please create issues on </span>
              <Link
                className="text-info-content hover:underline inline-flex"
                to="https://github.com/tuphan-dn/tuphan.dev/issues"
                target="_blank"
                rel="noreferrer"
              >
                my GitHub
                <ExternalLink className="w-3 h-3" />
              </Link>
              <span className="opacity-60"> for any questions.</span>
            </p>
          </div>
          <div id="prev-next" className="w-full grid grid-cols-2 gap-4">
            <Link
              className={clsx(
                'col-span-1 p-4 flex flex-col gap-1 items-start rounded-box bg-base-200 transition-all border-2 border-base-300',
                {
                  'pointer-events-none opacity-60': !prev,
                  'hover:bg-base-300': prev,
                },
              )}
              to={prev || '#'}
              aria-disabled={!prev}
            >
              <span className="text-xs opacity-60">Old Post</span>
              <span className="font-semibold text-left">{left}</span>
            </Link>
            <Link
              className={clsx(
                'col-span-1 p-4 flex flex-col gap-1 items-end rounded-box bg-base-200 transition-all border-2 border-base-300',
                {
                  'pointer-events-none opacity-60': !next,
                  'hover:bg-base-300': next,
                },
              )}
              to={next || '#'}
              aria-disabled={!next}
            >
              <span className="text-xs opacity-60">Next Post</span>
              <span className="font-semibold text-right">{right}</span>
            </Link>
          </div>
          <div id="suggestion" className="w-full grid grid-cols-12 gap-4">
            {[...routes].reverse().map((route) => (
              <div key={route} className="col-span-full">
                <BlogCard route={route} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
