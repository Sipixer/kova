import type { RouterClient } from "@orpc/server";
import { eventIterator } from "@orpc/server";
import { and, cosineDistance, desc, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure } from "../index";
import { subscribeCaptures } from "../captures-events";
import { pushCommand } from "../commands";
import { db } from "../db/client";
import { documents, opens } from "../db/schema";
import { embed } from "../embedding";
import { MachineSchema, presence } from "../presence";

const OWNER = "dev"; // until Better Auth lands

// A timeline row = one open joined with its document.
const timelineFields = {
  id: opens.id,
  documentId: documents.id,
  openedAt: opens.openedAt,
  title: documents.title,
  path: documents.path,
  source: documents.source,
  machineId: documents.machineId,
  summary: documents.summary,
  snippet: sql<string | null>`left(${documents.content}, 220)`,
  embedded: sql<boolean>`${documents.embedding} IS NOT NULL`,
};

const TimelineRowSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  openedAt: z.date(),
  title: z.string(),
  path: z.string(),
  source: z.string(),
  machineId: z.string(),
  summary: z.string().nullable(),
  snippet: z.string().nullable(),
  embedded: z.boolean(),
});

const recentTimeline = (limit: number) =>
  db
    .select(timelineFields)
    .from(opens)
    .innerJoin(documents, eq(opens.documentId, documents.id))
    .where(eq(documents.ownerId, OWNER))
    .orderBy(desc(opens.openedAt))
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

  timeline: {
    /** Recent opens (the activity timeline). */
    recent: publicProcedure
      .input(z.object({ limit: z.number().int().max(100).default(30) }).optional())
      .handler(({ input }) => recentTimeline(input?.limit ?? 30)),

    /** Live timeline — re-emits whenever a file is opened or finishes indexing. */
    live: publicProcedure
      .input(z.object({ limit: z.number().int().max(100).default(30) }).optional())
      .output(eventIterator(TimelineRowSchema.array()))
      .handler(async function* ({ input, signal }) {
        const limit = input?.limit ?? 30;
        const changes = subscribeCaptures(signal);
        yield await recentTimeline(limit);
        while (true) {
          const next = await changes.next();
          if (next.done) break;
          yield await recentTimeline(limit);
        }
      }),
  },

  /** Semantic search over embedded documents (one current version per file). */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().max(20).default(8),
      }),
    )
    .handler(async ({ input }) => {
      const vector = await embed(input.query, "high");
      const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, vector)})`;
      const lastOpenedAt = sql<Date | null>`(SELECT max(${opens.openedAt}) FROM ${opens} WHERE ${opens.documentId} = ${documents.id})`;
      return db
        .select({
          id: documents.id,
          title: documents.title,
          path: documents.path,
          source: documents.source,
          machineId: documents.machineId,
          snippet: sql<string | null>`left(${documents.content}, 220)`,
          lastOpenedAt,
          similarity,
        })
        .from(documents)
        .where(and(eq(documents.ownerId, OWNER), isNotNull(documents.embedding)))
        .orderBy(desc(similarity))
        .limit(input.limit);
    }),

  /**
   * Ask the agent to open a document's file (default app or default browser).
   * The client passes a document id — the server resolves the owner-scoped
   * machine + path, so a client can never make an agent open an arbitrary path.
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
      const [doc] = await db
        .select({ machineId: documents.machineId, path: documents.path })
        .from(documents)
        .where(and(eq(documents.ownerId, OWNER), eq(documents.id, input.id)))
        .limit(1);

      if (!doc?.path) return { sent: false };

      return {
        sent: pushCommand(doc.machineId, {
          type: "open",
          path: doc.path,
          app: input.app,
        }),
      };
    }),
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
