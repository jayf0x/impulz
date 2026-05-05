export type VisibilityCallback = (visible: boolean) => void;
export type FpsCallback = (fps: number) => void;
export type IdleCallback = () => void;

export interface FpsOptions {
  below?: number;
  above?: number;
  debounce?: number;
}

export interface IdleOptions {
  timeout?: number;
}

export interface Subscriber<T extends (...args: any[]) => void> {
  cb: T;
  options?: unknown;
  debounceTimer?: ReturnType<typeof setTimeout>;
  lastFired?: number;
  lastValue?: unknown;
}

export interface Monitor {
  start(): void;
  stop(): void;
  addSubscriber(id: symbol, sub: Subscriber<any>): void;
  removeSubscriber(id: symbol): void;
  subscriberCount(): number;
}

export type Signal = 'visibility' | 'fps' | 'idle';

export interface Pulse {
  on(signal: 'visibility', cb: VisibilityCallback): () => void;
  on(signal: 'fps', options: FpsOptions, cb: FpsCallback): () => void;
  on(signal: 'fps', cb: FpsCallback): () => void;
  on(signal: 'idle', options: IdleOptions, cb: IdleCallback): () => void;
  on(signal: 'idle', cb: IdleCallback): () => void;
  off(signal: Signal): void;
  destroy(): void;
}
