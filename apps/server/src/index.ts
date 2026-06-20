import { createContext } from "@kova/api/context";
import { presence } from "@kova/api/presence";
import { agentRouter } from "@kova/api/routers/agent";
import { appRouter } from "@kova/api/routers/index";
import { env } from "@kova/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler as WebSocketRPCHandler } from "@orpc/server/bun-ws";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [onError((error) => console.error(error))],
});

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [onError((error) => console.error(error))],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context,
  });
  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context,
  });
  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => c.text("OK"));

// ── Agents: oRPC over WebSocket ──────────────────────────────────────────────
// Each socket connection gets an id; agents call `register` over it, and the
// matching presence entry is dropped automatically when the socket closes.
const wsHandler = new WebSocketRPCHandler(agentRouter, {
  interceptors: [onError((error) => console.error(error))],
});

type WsData = { connectionId: string };

const server = Bun.serve<WsData>({
  port: Number(process.env.PORT) || 3000,
  fetch(req, srv) {
    if (new URL(req.url).pathname === "/ws") {
      const connectionId = crypto.randomUUID();
      if (srv.upgrade(req, { data: { connectionId } })) return;
      return new Response("WebSocket upgrade failed", { status: 426 });
    }
    return app.fetch(req);
  },
  websocket: {
    message(ws, message) {
      wsHandler.message(ws, message, {
        context: { connectionId: ws.data.connectionId },
      });
    },
    close(ws) {
      wsHandler.close(ws);
      presence.remove(ws.data.connectionId);
    },
  },
});

console.log(`🚀 Kova server ready on http://localhost:${server.port}  (ws: /ws)`);
