import { hostname } from "node:os";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import type { RouterClient } from "@orpc/server";

import type { AgentRouter } from "@kova/api/routers/agent";

const SERVER_WS_URL = process.env.SERVER_WS_URL ?? "ws://localhost:3000/ws";
const HEARTBEAT_MS = 15_000;

const machine = {
  hostname: hostname(),
  platform: process.platform,
  pid: process.pid,
};

const ws = new WebSocket(SERVER_WS_URL);
const link = new RPCLink({ websocket: ws });
const client: RouterClient<AgentRouter> = createORPCClient(link);

let heartbeat: ReturnType<typeof setInterval> | undefined;

ws.addEventListener("open", async () => {
  try {
    await client.register(machine);
    console.log(
      `[agent] connected to ${SERVER_WS_URL} as ${machine.hostname} (pid ${machine.pid})`,
    );
    heartbeat = setInterval(() => {
      client.heartbeat().catch(() => {});
    }, HEARTBEAT_MS);
  } catch (error) {
    console.error("[agent] failed to register:", error);
    process.exit(1);
  }
});

ws.addEventListener("close", () => {
  console.log("[agent] disconnected from server");
  if (heartbeat) clearInterval(heartbeat);
  process.exit(0);
});

ws.addEventListener("error", (event) => {
  console.error("[agent] socket error:", event);
});

function shutdown() {
  console.log("\n[agent] shutting down…");
  if (heartbeat) clearInterval(heartbeat);
  ws.close();
  setTimeout(() => process.exit(0), 50);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`[agent] connecting to ${SERVER_WS_URL}…`);
