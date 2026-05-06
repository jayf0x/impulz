import { useState, useEffect } from 'preact/hooks'
import { createPulse } from 'impulz'

export function usePulse() {
  const [fps, setFps] = useState(null)
  const [visible, setVisible] = useState(true)
  const [idle, setIdle] = useState(false)

  useEffect(() => {
    const pulse = createPulse()

    pulse.on('visibility', setVisible)
    pulse.on('fps', setFps)
    pulse.on('idle', { timeout: 4000 }, setIdle)

    return () => pulse.destroy()
  }, [])

  return { fps, visible, idle }
}
