import type { IdleCallback, IdleOptions, Monitor, Subscriber } from '../types.js';

interface IdleSubscriber extends Subscriber<IdleCallback> {
  options?: IdleOptions;
  handle?: number;
}

// requestIdleCallback is not in all TS lib targets; use window cast to avoid conflicts
const ric = (typeof window !== 'undefined' && (window as any).requestIdleCallback) as
  | ((cb: IdleRequestCallback, opts?: IdleRequestOptions) => number)
  | undefined;
const cic = (typeof window !== 'undefined' && (window as any).cancelIdleCallback) as
  | ((handle: number) => void)
  | undefined;

export function createIdleMonitor(): Monitor {
  const subscribers = new Map<symbol, IdleSubscriber>();
  let started = false;

  function getKey(target: IdleSubscriber): symbol | undefined {
    for (const [k, v] of subscribers) {
      if (v === target) return k;
    }
    return undefined;
  }

  function scheduleIdle(sub: IdleSubscriber) {
    const timeout = sub.options?.timeout ?? 2000;

    if (typeof ric === 'function') {
      sub.handle = ric(
        () => {
          sub.cb();
          if (started && subscribers.has(getKey(sub)!)) scheduleIdle(sub);
        },
        { timeout }
      );
    } else {
      sub.handle = window.setTimeout(() => {
        sub.cb();
        if (started && subscribers.has(getKey(sub)!)) scheduleIdle(sub);
      }, timeout) as unknown as number;
    }
  }

  function cancelIdle(sub: IdleSubscriber) {
    if (sub.handle == null) return;
    if (typeof cic === 'function') {
      cic(sub.handle);
    } else {
      clearTimeout(sub.handle);
    }
    sub.handle = undefined;
  }

  return {
    start() {
      if (started) return;
      started = true;
      for (const sub of subscribers.values()) scheduleIdle(sub);
    },

    stop() {
      if (!started) return;
      started = false;
      for (const sub of subscribers.values()) cancelIdle(sub);
    },

    addSubscriber(id, sub) {
      const idleSub = sub as IdleSubscriber;
      subscribers.set(id, idleSub);
      if (started) scheduleIdle(idleSub);
    },

    removeSubscriber(id) {
      const sub = subscribers.get(id);
      if (sub) {
        cancelIdle(sub);
        subscribers.delete(id);
      }
    },

    subscriberCount() {
      return subscribers.size;
    },
  };
}
