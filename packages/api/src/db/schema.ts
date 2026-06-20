import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

/**
 * One row per file (per machine + path). Holds the *current* version: the
 * extracted text, its embedding, and `lastModified` (the file's mtime = its
 * version). When the file changes, content + embedding are replaced in place.
 * `ownerId` defaults to "dev" until Better Auth lands.
 */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id").notNull().default("dev"),
    machineId: text("machine_id").notNull(),
    path: text("path").notNull(),
    title: text("title").notNull(),
    source: text("source").notNull(), // ext: docx, pdf, png…
    content: text("content"),
    summary: text("summary"), // tiny one-liner about the file, for display
    embedding: vector("embedding", { dimensions: 384 }),
    lastModified: timestamp("last_modified", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("documents_owner_machine_path").on(t.ownerId, t.machineId, t.path)],
);

/** One row per time a document was opened — the consultation history (timeline). */
export const opens = pgTable(
  "opens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    openedAt: timestamp("opened_at", { withTimezone: true }).notNull(),
  },
  (t) => [unique("opens_document_opened").on(t.documentId, t.openedAt)],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Open = typeof opens.$inferSelect;
