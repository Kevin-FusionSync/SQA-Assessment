import { useEffect } from 'react'

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · FreshCart` : 'FreshCart – Fresh groceries, delivered'
  }, [title])
}
