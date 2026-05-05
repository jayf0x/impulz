import type { VisibilityCallback, Monitor, Subscriber } from '../types.js';

export function createVisibilityMonitor(): Monitor {
  const subscribers = new Map<symbol, Subscriber<VisibilityCallback>>();
  let started = false;

  function handleChange() {
    const visible = document.visibilityState === 'visible';
    for (const sub of subscribers.values()) {
      sub.cb(visible);
    }
  }

  return {
    start() {
      if (started) return;
      started = true;
      document.addEventListener('visibilitychange', handleChange);
    },

    stop() {
      if (!started) return;
      started = false;
      document.removeEventListener('visibilitychange', handleChange);
    },

    addSubscriber(id, sub) {
      subscribers.set(id, sub);
      // Emit current state immediately
      sub.cb(document.visibilityState === 'visible');
    },

    removeSubscriber(id) {
      subscribers.delete(id);
    },

    subscriberCount() {
      return subscribers.size;
    },
  };
}
