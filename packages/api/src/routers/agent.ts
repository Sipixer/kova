import { eventIterator, os } from "@orpc/server";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";

import { notifyCapturesChanged } from "../captures-events";
import { CommandSchema, subscribeCommands } from "../commands";
import { db } from "../db/client";
import { documents, opens } from "../db/schema";
import { embed } from "../embedding";
import { presence } from "../presence";

const OWNER = "dev"; // until Better Auth lands

/** Background embedding: fills a document's vector, then notifies live queries. */
async function embedDocument(id: string, text: string) {
  try {
    const embedding = await embed(text, "low");
    await db.update(documents).set({ embedding }).where(eq(documents.id, id));
    notifyCapturesChanged();
  } catch (error) {
    console.error(`[embed] failed for document ${id}:`, error);
  }
}

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

  /**
   * What the server already has for a machine (path + the version it knows).
   * The agent diffs this against its Recent log to send only new/changed files.
   */
  sync: ao.input(z.object({ machineId: z.string() })).handler(({ input }) =>
    db
      .select({
        path: documents.path,
        lastModified: documents.lastModified,
      })
      .from(documents)
      .where(
        and(
          eq(documents.ownerId, OWNER),
          eq(documents.machineId, input.machineId),
          isNotNull(documents.lastModified),
        ),
      ),
  ),

  /**
   * Record that a file was opened. When `content` is present (string or null),
   * the agent has decided the file is new/updated → upsert + (re)embed. When
   * `content` is omitted, only the open event is recorded (no re-embed).
   */
  ingest: ao
    .input(
      z.object({
        machineId: z.string(),
        path: z.string(),
        title: z.string(),
        source: z.string(),
        openedAt: z.number(),
        lastModified: z.number().optional(),
        content: z.string().nullable().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const lastModified = input.lastModified
        ? new Date(input.lastModified)
        : undefined;

      const [existing] = await db
        .select({
          id: documents.id,
          lastModified: documents.lastModified,
          hasEmbedding: sql<boolean>`${documents.embedding} IS NOT NULL`,
        })
        .from(documents)
        .where(
          and(
            eq(documents.ownerId, OWNER),
            eq(documents.machineId, input.machineId),
            eq(documents.path, input.path),
          ),
        )
        .limit(1);

      let documentId: string;
      let needEmbed = false;

      if (!existing) {
        const [row] = await db
          .insert(documents)
          .values({
            machineId: input.machineId,
            path: input.path,
            title: input.title,
            source: input.source,
            content: input.content ?? null,
            lastModified,
          })
          .returning({ id: documents.id });
        documentId = row?.id ?? "";
        needEmbed = true;
      } else {
        documentId = existing.id;
        const newer =
          lastModified !== undefined &&
          (!existing.lastModified || lastModified > existing.lastModified);
        if (input.content !== undefined && (newer || !existing.hasEmbedding)) {
          await db
            .update(documents)
            .set({
              title: input.title,
              source: input.source,
              content: input.content ?? null,
              lastModified: lastModified ?? existing.lastModified,
              embedding: null,
              updatedAt: new Date(),
            })
            .where(eq(documents.id, documentId));
          needEmbed = true;
        }
      }

      // Record the open (idempotent on (documentId, openedAt)).
      await db
        .insert(opens)
        .values({ documentId, openedAt: new Date(input.openedAt) })
        .onConflictDoNothing();

      notifyCapturesChanged();

      if (needEmbed) {
        void embedDocument(
          documentId,
          [input.title, input.content].filter(Boolean).join("\n"),
        );
      }

      return { documentId };
    }),
};

export type AgentRouter = typeof agentRouter;
