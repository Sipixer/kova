import { os } from "@orpc/server";
import { z } from "zod";

import { presence } from "../presence";

/**
 * Procedures the agent calls over WebSocket. The server injects the
 * per-connection `connectionId` into the context so presence is tied to
 * the live socket (removed automatically when the socket closes).
 */
const ao = os.$context<{ connectionId: string }>();

export const agentRouter = {
  register: ao
    .input(
      z.object({
        hostname: z.string(),
        platform: z.string(),
        pid: z.number().int(),
      }),
    )
    .handler(({ input, context }) => {
      presence.add(context.connectionId, input);
      return { id: context.connectionId };
    }),

  heartbeat: ao.handler(() => ({ ok: true as const })),
};

export type AgentRouter = typeof agentRouter;
