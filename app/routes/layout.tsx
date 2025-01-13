import { Outlet } from '@remix-run/react'
import UiProvider from '~/providers/ui.provider'
import Footer from './footer'

export default function Layout() {
  return (
    <UiProvider>
      <main className="w-full min-h-dvh flex flex-col">
        <section className="grow grid grid-cols-1">
          <div className="col-span-full">
            <Outlet />
          </div>
        </section>
        <footer className="sticky bottom-2 w-full flex flex-row justify-center">
          <Footer />
        </footer>
      </main>
    </UiProvider>
  )
}
