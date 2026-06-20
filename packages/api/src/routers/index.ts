import type { RouterClient } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { and, cosineDistance, desc, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";
import { subscribeCaptures } from "../captures-events";
import { pushCommand } from "../commands";
import { db } from "../db/client";
import { captures } from "../db/schema";
import { embed } from "../embedding";
import { MachineSchema, presence } from "../presence";

const OWNER = "dev"; // until Better Auth lands

const captureFields = {
  id: captures.id,
  source: captures.source,
  app: captures.app,
  title: captures.title,
  path: captures.path,
  machineId: captures.machineId,
  capturedAt: captures.capturedAt,
  snippet: sql<string | null>`left(${captures.content}, 220)`,
  embedded: sql<boolean>`${captures.embedding} IS NOT NULL`,
};

const CaptureRowSchema = z.object({
  id: z.string(),
  source: z.string(),
  app: z.string().nullable(),
  title: z.string(),
  path: z.string().nullable(),
  machineId: z.string(),
  capturedAt: z.date(),
  snippet: z.string().nullable(),
  embedded: z.boolean(),
});

const recentCaptures = (limit: number) =>
  db
    .select(captureFields)
    .from(captures)
    .where(eq(captures.ownerId, OWNER))
    .orderBy(desc(captures.capturedAt))
    .limit(limit);

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

  captures: {
    /** Most recent captures (the activity timeline). */
    recent: publicProcedure
      .input(z.object({ limit: z.number().int().max(100).default(30) }).optional())
      .handler(({ input }) => recentCaptures(input?.limit ?? 30)),

    /** Live recent captures — re-emits whenever a new file is captured. */
    live: publicProcedure
      .input(z.object({ limit: z.number().int().max(100).default(30) }).optional())
      .output(eventIterator(CaptureRowSchema.array()))
      .handler(async function* ({ input, signal }) {
        const limit = input?.limit ?? 30;
        const changes = subscribeCaptures(signal);
        yield await recentCaptures(limit);
        while (true) {
          const next = await changes.next();
          if (next.done) break;
          yield await recentCaptures(limit);
        }
      }),

    /** Semantic search over embedded captures. */
    search: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().int().max(20).default(8) }))
      .handler(async ({ input }) => {
        const vector = await embed(input.query, "high");
        const similarity = sql<number>`1 - (${cosineDistance(captures.embedding, vector)})`;
        return db
          .select({ ...captureFields, similarity })
          .from(captures)
          .where(and(eq(captures.ownerId, OWNER), isNotNull(captures.embedding)))
          .orderBy(desc(similarity))
          .limit(input.limit);
      }),
  },

  /**
   * Ask the agent to open a captured file. The client only passes the capture
   * id — the server resolves the (owner-scoped) machine + path from the DB, so
   * a client can never make an agent open an arbitrary path.
   */
  openFile: publicProcedure
    .input(
      z.object({
        id: z.string(),
        app: z.enum(["default", "browser"]).default("default"),
      }),
    )
    .output(z.object({ sent: z.boolean() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select({ machineId: captures.machineId, path: captures.path })
        .from(captures)
        .where(and(eq(captures.ownerId, OWNER), eq(captures.id, input.id)))
        .limit(1);

      if (!row?.path) return { sent: false };

      return {
        sent: pushCommand(row.machineId, {
          type: "open",
          path: row.path,
          app: input.app,
        }),
      };
    }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
