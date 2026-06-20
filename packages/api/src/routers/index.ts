import type { RouterClient } from "@orpc/server";
import { eventIterator } from "@orpc/server";

import { publicProcedure } from "../index";
import { MachineSchema, presence } from "../presence";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),

  machines: {
    /** Snapshot of currently connected machines. */
    list: publicProcedure
      .output(MachineSchema.array())
      .handler(() => presence.list()),

    /** Live stream of the machine list — re-emits on every connect/disconnect. */
    live: publicProcedure
      .output(eventIterator(MachineSchema.array()))
      .handler(async function* ({ signal }) {
        yield presence.list();
        for await (const machines of presence.subscribe(signal)) {
          yield machines;
        }
      }),
  },
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
