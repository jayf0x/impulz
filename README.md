# impulz

Zero-dependency browser performance monitors. Track **visibility**, **FPS**, and **idle** signals with a minimal, tree-shakeable API.

```
npm install impulz
```

## Quick start

```js
import { createPulse } from 'impulz'

const pulse = createPulse()

// Pause work when tab is hidden
pulse.on('visibility', (visible) => {
  visible ? canvas.resume() : canvas.pause()
})

// Reduce quality when FPS drops
pulse.on('fps', { below: 30, debounce: 500 }, reduceResolution)
pulse.on('fps', { above: 55, debounce: 1000 }, restoreResolution)

// Flush analytics when browser is idle
pulse.on('idle', { timeout: 2000 }, flushAnalyticsBuffer)

// Each on() returns an unsubscribe fn
const off = pulse.on('visibility', cb)
off() // remove just this subscriber

// Remove all subscribers for a signal
pulse.off('visibility')

// Tear down everything
pulse.destroy()
```

## React

```tsx
import { usePulse } from 'impulz/react'

function MyComponent() {
  const { visible, fps, isIdle } = usePulse(['visibility', 'fps', 'idle'], {
    debounce: 400,
    fpsBelow: 30,
  })

  return <div>{fps} fps — {visible ? 'active' : 'hidden'}</div>
}
```

## API

### `createPulse()`

Returns a `Pulse` instance.

### `pulse.on(signal, [options], callback)`

Subscribe to a signal. Returns an unsubscribe function.

| Signal | Options | Callback |
|--------|---------|----------|
| `'visibility'` | — | `(visible: boolean) => void` |
| `'fps'` | `{ below?, above?, debounce? }` | `(fps: number) => void` |
| `'idle'` | `{ timeout? }` | `() => void` |

- **FPS `below` / `above`**: only fire when the rolling average crosses the threshold.
- **FPS `debounce`**: delay before firing after condition first met.
- **Idle `timeout`**: passed to `requestIdleCallback` (or `setTimeout` fallback).

### `pulse.off(signal)`

Remove **all** subscribers for the given signal. Stops the underlying monitor.

### `pulse.destroy()`

Remove all subscribers and stop all monitors.

## How it works

- **Lazy start**: a monitor only runs while it has at least one subscriber.
- **Visibility**: wraps `document.visibilityState` + `visibilitychange`. Fires immediately with current state on subscribe.
- **FPS**: `requestAnimationFrame` loop with a rolling 10-frame window, emits ~every 500 ms.
- **Idle**: `requestIdleCallback` with a `setTimeout` fallback, re-schedules automatically.

## Demo

Open `demo/index.html` directly in a browser — no build step required.

## Building

```
npm install
npm run build      # compiles to packages/pulse/dist/
npm run typecheck  # type-check without emitting
```
