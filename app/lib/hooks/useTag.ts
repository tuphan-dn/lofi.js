import { useParams } from '@remix-run/react'

export function useTag() {
  const params = useParams()
  return params.tag || ''
}
