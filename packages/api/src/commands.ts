import { z } from "zod";

/** Commands the server pushes down to an agent over its WebSocket. */
export const CommandSchema = z.object({
  type: z.literal("open"),
  path: z.string(),
  app: z.enum(["default", "browser"]).default("default"),
});

export type Command = z.infer<typeof CommandSchema>;

type Listener = (command: Command) => void;

// machineId (hostname) -> active command listeners (one per connected agent).
const listeners = new Map<string, Set<Listener>>();

/** Push a command to every agent currently listening for a machine. */
export function pushCommand(machineId: string, command: Command): boolean {
  const set = listeners.get(machineId);
  if (!set || set.size === 0) return false;
  for (const listener of set) listener(command);
  return true;
}

/** Stream commands targeted at `machineId` until the socket/stream closes. */
export async function* subscribeCommands(
  machineId: string,
  signal?: AbortSignal,
): AsyncGenerator<Command> {
  const queue: Command[] = [];
  let wake: (() => void) | null = null;

  const listener: Listener = (command) => {
    queue.push(command);
    wake?.();
    wake = null;
  };
  const onAbort = () => {
    wake?.();
    wake = null;
  };

  let set = listeners.get(machineId);
  if (!set) {
    set = new Set();
    listeners.set(machineId, set);
  }
  set.add(listener);
  signal?.addEventListener("abort", onAbort);

  try {
    while (!signal?.aborted) {
      if (queue.length === 0) {
        await new Promise<void>((resolve) => {
          wake = resolve;
        });
      }
      while (queue.length > 0) {
        yield queue.shift() as Command;
      }
    }
  } finally {
    set.delete(listener);
    if (set.size === 0) listeners.delete(machineId);
    signal?.removeEventListener("abort", onAbort);
  }
}
