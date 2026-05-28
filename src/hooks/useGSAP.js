import { useEffect, useRef } from 'react'
import { gsap } from '@/utils/gsapConfig'

export function useGSAP(callback, deps = []) {
  const contextRef = useRef(null)

  useEffect(() => {
    contextRef.current = gsap.context(callback)
    return () => contextRef.current?.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
