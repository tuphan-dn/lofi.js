import { type ReactNode } from 'react'
import dayjs from 'dayjs'

import { env } from '~/configs/env'

export type ScheduleProps = {
  children: ReactNode
  published?: Date
}

export default function Schedule({
  children,
  published = new Date(Date.now() + 1),
}: ScheduleProps) {
  if (new Date(published) > new Date() && env !== 'development')
    return (
      <div className="not-prose w-full flex flex-col gap-4 items-center text-base-content">
        <h1>Not Published Yet!</h1>
        <p>
          <span className="opacity-60">This article will be available in </span>
          <span>{dayjs(published).format('DD MMMM, YYYY.')}</span>
        </p>
        <img
          className="rounded-box"
          src="/meme-tat-22.jpg"
          alt="not published yet"
        />
      </div>
    )
  return <>{children}</>
}
