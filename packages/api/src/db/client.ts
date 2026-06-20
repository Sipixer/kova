import { env } from "@kova/env/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Neon's pooled endpoint is pgbouncer-style (transaction pooling) → disable
// prepared statements.
const queryClient = postgres(env.DATABASE_URL, {
  prepare: false,
  ssl: "require",
});

export const db = drizzle(queryClient, { schema });
