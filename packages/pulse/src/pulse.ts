import { createVisibilityMonitor } from './monitors/visibility.js';
import { createFpsMonitor } from './monitors/fps.js';
import { createIdleMonitor } from './monitors/idle.js';
import type {
  Pulse,
  Signal,
  VisibilityCallback,
  FpsCallback,
  IdleCallback,
  FpsOptions,
  IdleOptions,
  Monitor,
  Subscriber,
} from './types.js';

export function createPulse(): Pulse {
  const monitors: Record<Signal, Monitor> = {
    visibility: createVisibilityMonitor(),
    fps: createFpsMonitor(),
    idle: createIdleMonitor(),
  };

  // symbol → signal, for destroy / off
  const subSignals = new Map<symbol, Signal>();

  function addSub(signal: Signal, sub: Subscriber<any>): () => void {
    const id = Symbol();
    subSignals.set(id, signal);
    const monitor = monitors[signal];

    if (monitor.subscriberCount() === 0) monitor.start();
    monitor.addSubscriber(id, sub);

    return () => removeSub(id);
  }

  function removeSub(id: symbol) {
    const signal = subSignals.get(id);
    if (!signal) return;
    subSignals.delete(id);
    const monitor = monitors[signal];
    monitor.removeSubscriber(id);
    if (monitor.subscriberCount() === 0) monitor.stop();
  }

  const pulse: Pulse = {
    on(signal: Signal, optionsOrCb: any, maybeCb?: any): () => void {
      if (signal === 'visibility') {
        const cb = optionsOrCb as VisibilityCallback;
        return addSub('visibility', { cb });
      }

      if (signal === 'fps') {
        if (typeof optionsOrCb === 'function') {
          return addSub('fps', { cb: optionsOrCb as FpsCallback });
        }
        const options = optionsOrCb as FpsOptions;
        const cb = maybeCb as FpsCallback;
        return addSub('fps', { cb, options });
      }

      if (signal === 'idle') {
        if (typeof optionsOrCb === 'function') {
          return addSub('idle', { cb: optionsOrCb as IdleCallback });
        }
        const options = optionsOrCb as IdleOptions;
        const cb = maybeCb as IdleCallback;
        return addSub('idle', { cb, options });
      }

      throw new Error(`Unknown signal: ${signal}`);
    },

    off(signal: Signal) {
      const idsToRemove: symbol[] = [];
      for (const [id, sig] of subSignals) {
        if (sig === signal) idsToRemove.push(id);
      }
      for (const id of idsToRemove) removeSub(id);
    },

    destroy() {
      for (const id of [...subSignals.keys()]) removeSub(id);
    },
  };

  return pulse;
}
