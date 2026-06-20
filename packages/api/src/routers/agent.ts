import { eventIterator, os } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { CommandSchema, subscribeCommands } from "../commands";
import { db } from "../db/client";
import { captures } from "../db/schema";
import { embed } from "../embedding";
import { presence } from "../presence";

const OWNER = "dev"; // until Better Auth lands

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

  /** Stream of commands the server wants this machine to run (e.g. open a file). */
  commands: ao
    .input(z.object({ machineId: z.string() }))
    .output(eventIterator(CommandSchema))
    .handler(async function* ({ input, signal }) {
      for await (const command of subscribeCommands(input.machineId, signal)) {
        yield command;
      }
    }),

  /** A focus capture from the agent. Text content (if any) is embedded here. */
  ingest: ao
    .input(
      z.object({
        machineId: z.string(),
        source: z.string(),
        app: z.string().optional(),
        title: z.string(),
        path: z.string().optional(),
        content: z.string().optional(),
        capturedAt: z.number().int().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const capturedAt = input.capturedAt
        ? new Date(input.capturedAt)
        : undefined;

      // Dedup: same file opened at the same time → already indexed.
      if (input.path && capturedAt) {
        const existing = await db
          .select({ id: captures.id })
          .from(captures)
          .where(
            and(
              eq(captures.ownerId, OWNER),
              eq(captures.path, input.path),
              eq(captures.capturedAt, capturedAt),
            ),
          )
          .limit(1);
        if (existing[0]) return { id: existing[0].id, deduped: true };
      }

      // Embed the filename at minimum (so name-only files like images are
      // searchable), plus the extracted content when available.
      const embedding =
        input.path || input.content
          ? await embed([input.title, input.content].filter(Boolean).join("\n"))
          : null;

      const [row] = await db
        .insert(captures)
        .values({
          machineId: input.machineId,
          source: input.source,
          app: input.app,
          title: input.title,
          path: input.path,
          content: input.content,
          embedding,
          capturedAt,
        })
        .returning({ id: captures.id });

      return { id: row?.id, deduped: false };
    }),
};

export type AgentRouter = typeof agentRouter;
