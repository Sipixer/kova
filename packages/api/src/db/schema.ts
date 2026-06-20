import {
  pgTable,
  text,
  timestamp,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

/**
 * Every focus capture. `content`/`embedding` stay null for non-document focus
 * (a window, a browser tab) and get filled when a document is read + embedded.
 * `ownerId` defaults to "dev" until Better Auth lands.
 */
export const captures = pgTable("captures", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull().default("dev"),
  machineId: text("machine_id").notNull(),
  source: text("source").notNull(), // "docx" | "xlsx" | "pdf" | "window"
  app: text("app"),
  title: text("title").notNull(),
  path: text("path"),
  content: text("content"),
  embedding: vector("embedding", { dimensions: 384 }),
  capturedAt: timestamp("captured_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Capture = typeof captures.$inferSelect;
export type NewCapture = typeof captures.$inferInsert;
