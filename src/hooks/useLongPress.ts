import { useRef } from 'react'

type UseLongPressOptions = {
  onPress: () => void
  onLongPress: () => void
  delay?: number
}

const useLongPress = ({ onPress, onLongPress, delay = 500 }: UseLongPressOptions) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const longPressedRef = useRef(false)

  const onPointerDown = () => {
    longPressedRef.current = false
    timerRef.current = setTimeout(() => {
      longPressedRef.current = true
      onLongPress()
    }, delay)
  }

  const onPointerUp = () => {
    clearTimeout(timerRef.current)
    if (!longPressedRef.current) {
      onPress()
    }
  }

  const onPointerLeave = () => {
    clearTimeout(timerRef.current)
  }

  return { onPointerDown, onPointerUp, onPointerLeave }
}

export default useLongPress
