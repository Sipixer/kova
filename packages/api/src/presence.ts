import { z } from "zod";

/** A connected agent/machine, keyed by its WebSocket connection id. */
export const MachineSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  platform: z.string(),
  pid: z.number().int(),
  connectedAt: z.number().int(),
});

export type Machine = z.infer<typeof MachineSchema>;

/**
 * Minimal in-memory pub/sub backed by an async iterator.
 * `subscribe(signal)` yields every emitted value until `signal` aborts
 * (i.e. the streaming client disconnects), then cleans itself up.
 */
class Channel<T> {
  private readonly listeners = new Set<(value: T) => void>();

  emit(value: T) {
    for (const listener of this.listeners) listener(value);
  }

  async *subscribe(signal?: AbortSignal): AsyncGenerator<T> {
    const queue: T[] = [];
    let wake: (() => void) | null = null;

    const listener = (value: T) => {
      queue.push(value);
      wake?.();
      wake = null;
    };
    const onAbort = () => {
      wake?.();
      wake = null;
    };

    this.listeners.add(listener);
    signal?.addEventListener("abort", onAbort);

    try {
      while (!signal?.aborted) {
        if (queue.length === 0) {
          await new Promise<void>((resolve) => {
            wake = resolve;
          });
        }
        while (queue.length > 0) {
          yield queue.shift() as T;
        }
      }
    } finally {
      this.listeners.delete(listener);
      signal?.removeEventListener("abort", onAbort);
    }
  }
}

const machines = new Map<string, Machine>();
const channel = new Channel<Machine[]>();

const snapshot = (): Machine[] => [...machines.values()];

export const presence = {
  list: snapshot,

  add(id: string, info: Omit<Machine, "id" | "connectedAt">) {
    machines.set(id, { id, connectedAt: Date.now(), ...info });
    console.log(
      `[presence] + ${info.hostname} (pid ${info.pid}) connected — ${machines.size} online`,
    );
    channel.emit(snapshot());
  },

  remove(id: string) {
    const machine = machines.get(id);
    if (!machines.delete(id)) return;
    console.log(
      `[presence] - ${machine?.hostname} (pid ${machine?.pid}) disconnected — ${machines.size} online`,
    );
    channel.emit(snapshot());
  },

  subscribe: (signal?: AbortSignal) => channel.subscribe(signal),
};
