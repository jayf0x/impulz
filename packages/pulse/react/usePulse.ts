// Separate entry point — tree-shakeable, peer-dep on react
import { useState, useEffect, useRef } from 'react';
import { createPulse } from '../src/index.js';
import type { FpsOptions } from '../src/types.js';

export type PulseSignal = 'visibility' | 'fps' | 'idle';

export interface UsePulseOptions {
  debounce?: number;
  fpsBelow?: number;
  fpsAbove?: number;
  idleTimeout?: number;
}

export interface PulseState {
  visible: boolean;
  fps: number | null;
  isIdle: boolean;
}

export function usePulse(
  signals: PulseSignal[],
  options: UsePulseOptions = {}
): PulseState {
  const [state, setState] = useState<PulseState>({
    visible: typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true,
    fps: null,
    isIdle: false,
  });

  // Stable ref so effect doesn't re-run on each render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const pulse = createPulse();
    const unsubs: Array<() => void> = [];

    if (signals.includes('visibility')) {
      unsubs.push(
        pulse.on('visibility', (visible) =>
          setState((s) => ({ ...s, visible }))
        )
      );
    }

    if (signals.includes('fps')) {
      const fpsOpts: FpsOptions = {};
      if (optionsRef.current.debounce != null)
        fpsOpts.debounce = optionsRef.current.debounce;
      if (optionsRef.current.fpsBelow != null)
        fpsOpts.below = optionsRef.current.fpsBelow;
      if (optionsRef.current.fpsAbove != null)
        fpsOpts.above = optionsRef.current.fpsAbove;

      unsubs.push(
        pulse.on('fps', fpsOpts, (fps) =>
          setState((s) => ({ ...s, fps }))
        )
      );
    }

    if (signals.includes('idle')) {
      unsubs.push(
        pulse.on(
          'idle',
          { timeout: optionsRef.current.idleTimeout ?? 2000 },
          () => {
            setState((s) => ({ ...s, isIdle: true }));
            // Reset after short delay so consumers can react to the pulse
            setTimeout(() => setState((s) => ({ ...s, isIdle: false })), 100);
          }
        )
      );
    }

    return () => {
      for (const unsub of unsubs) unsub();
      pulse.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signals.join(',')]);

  return state;
}
