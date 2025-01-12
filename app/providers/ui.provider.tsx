import { type ReactNode, useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { NProgress } from 'nprogress-v2'
import { useNavigation } from '@remix-run/react'

import Message from '~/components/message'

import 'nprogress-v2/dist/index.css'

/**
 * Provider
 */

export default function UiProvider({ children }: { children: ReactNode }) {
  const { state } = useNavigation()

  useEffect(() => {
    NProgress.configure({ showSpinner: false })
    if (state === 'idle') NProgress.done()
    else NProgress.start()
  }, [state])

  return (
    <ThemeProvider>
      {children}
      <Message />
    </ThemeProvider>
  )
}
