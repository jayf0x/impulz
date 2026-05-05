import type { FpsCallback, FpsOptions, Monitor, Subscriber } from '../types.js';

const WINDOW_SIZE = 10;
const EMIT_INTERVAL_MS = 500;

interface FpsSubscriber extends Subscriber<FpsCallback> {
  options?: FpsOptions;
  debounceTimer?: ReturnType<typeof setTimeout>;
  conditionMet?: boolean;
}

export function createFpsMonitor(): Monitor {
  const subscribers = new Map<symbol, FpsSubscriber>();
  let rafHandle = 0;
  let started = false;
  const frameTimes: number[] = [];
  let lastEmitTime = 0;
  let currentFps = 0;

  function tick(now: number) {
    frameTimes.push(now);
    if (frameTimes.length > WINDOW_SIZE) frameTimes.shift();

    if (frameTimes.length >= 2 && now - lastEmitTime >= EMIT_INTERVAL_MS) {
      lastEmitTime = now;
      const oldest = frameTimes[0];
      const elapsed = now - oldest;
      currentFps = Math.round(((frameTimes.length - 1) / elapsed) * 1000);
      emit(currentFps);
    }

    if (started) rafHandle = requestAnimationFrame(tick);
  }

  function emit(fps: number) {
    for (const [, sub] of subscribers) {
      const opts = sub.options ?? {};
      const meetsCondition =
        (opts.below === undefined || fps < opts.below) &&
        (opts.above === undefined || fps > opts.above);

      if (!meetsCondition) {
        sub.conditionMet = false;
        return;
      }

      // Already firing / debouncing for this condition window
      if (sub.conditionMet && sub.debounceTimer != null) return;

      sub.conditionMet = true;

      const fire = () => {
        sub.debounceTimer = undefined;
        sub.cb(fps);
      };

      if (opts.debounce && opts.debounce > 0) {
        clearTimeout(sub.debounceTimer);
        sub.debounceTimer = setTimeout(fire, opts.debounce);
      } else {
        fire();
      }
    }
  }

  return {
    start() {
      if (started) return;
      started = true;
      frameTimes.length = 0;
      lastEmitTime = 0;
      rafHandle = requestAnimationFrame(tick);
    },

    stop() {
      if (!started) return;
      started = false;
      cancelAnimationFrame(rafHandle);
      rafHandle = 0;
      for (const sub of subscribers.values()) {
        clearTimeout(sub.debounceTimer);
        sub.debounceTimer = undefined;
        sub.conditionMet = false;
      }
    },

    addSubscriber(id, sub) {
      subscribers.set(id, sub as FpsSubscriber);
    },

    removeSubscriber(id) {
      const sub = subscribers.get(id);
      if (sub) {
        clearTimeout(sub.debounceTimer);
        subscribers.delete(id);
      }
    },

    subscriberCount() {
      return subscribers.size;
    },
  };
}
