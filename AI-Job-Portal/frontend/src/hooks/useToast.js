import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { pushToast } from '@/store/uiSlice'

export function useToast() {
  const dispatch = useDispatch()

  const notify = useCallback(
    (variant) => (title, description) => dispatch(pushToast({ title, description, variant })),
    [dispatch],
  )

  return {
    success: notify('success'),
    error: notify('destructive'),
    info: notify('default'),
  }
}
