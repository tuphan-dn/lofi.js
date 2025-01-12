import { Outlet } from '@remix-run/react'

export default function Layout() {
  return (
    <div className="bg-yellow-300 p-4">
      <Outlet />
    </div>
  )
}
