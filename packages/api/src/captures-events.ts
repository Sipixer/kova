// Fires whenever a new capture is stored, so live queries can re-emit.
type Listener = () => void;

const listeners = new Set<Listener>();

export function notifyCapturesChanged() {
  for (const listener of listeners) listener();
}

/** Yields once per batch of new captures until the stream/socket closes. */
export async function* subscribeCaptures(
  signal?: AbortSignal,
): AsyncGenerator<void> {
  let ticks = 0;
  let seen = 0;
  let wake: (() => void) | null = null;

  const listener = () => {
    ticks++;
    wake?.();
    wake = null;
  };
  const onAbort = () => {
    wake?.();
    wake = null;
  };

  listeners.add(listener);
  signal?.addEventListener("abort", onAbort);

  try {
    while (!signal?.aborted) {
      if (ticks === seen) {
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
      seen = ticks;
      if (!signal?.aborted) yield;
    }
  } finally {
    listeners.delete(listener);
    signal?.removeEventListener("abort", onAbort);
  }
}
