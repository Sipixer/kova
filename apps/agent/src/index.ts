import { stat } from "node:fs/promises";
import { hostname } from "node:os";
import { basename, extname } from "node:path";

import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/websocket";
import type { RouterClient } from "@orpc/server";

import type { AgentRouter } from "@kova/api/routers/agent";

import { extractText, isSupported } from "./extract";
import { type RecentDoc, watchRecent } from "./recent";

const SERVER_WS_URL = process.env.SERVER_WS_URL ?? "ws://localhost:3000/ws";
const HEARTBEAT_MS = 15_000;
const MAX_CONTENT = 20_000;
const MACHINE = hostname();

const ws = new WebSocket(SERVER_WS_URL);
const link = new RPCLink({ websocket: ws });
const client: RouterClient<AgentRouter> = createORPCClient(link);

// path -> the file mtime (ms) the server already knows. Seeded by sync() so we
// only re-send content for new or modified files (no agent-side DB needed).
const versionCache = new Map<string, number>();

let heartbeat: ReturnType<typeof setInterval> | undefined;
let stopWatch: (() => void) | undefined;

async function indexDoc(doc: RecentDoc) {
  let mtimeMs: number;
  try {
    mtimeMs = Math.floor((await stat(doc.path)).mtimeMs);
  } catch {
    return; // file no longer exists
  }

  const known = versionCache.get(doc.path);
  const changed = known === undefined || mtimeMs > known;
  const title = basename(doc.path);
  const source = extname(doc.path).slice(1).toLowerCase() || "file";

  try {
    if (changed) {
      const extracted = isSupported(doc.path)
        ? await extractText(doc.path)
        : null;
      const content = extracted?.text.trim()
        ? extracted.text.slice(0, MAX_CONTENT)
        : null; // null = name-only (still searchable by filename)

      await client.ingest({
        machineId: MACHINE,
        path: doc.path,
        title,
        source,
        openedAt: doc.openedAt,
        lastModified: mtimeMs,
        content,
      });
      versionCache.set(doc.path, mtimeMs);
      console.log(`[agent] indexed ${title}${content ? "" : " (name only)"}`);
    } else {
      // Unchanged file: just record the open (cheap, deduped server-side).
      await client.ingest({
        machineId: MACHINE,
        path: doc.path,
        title,
        source,
        openedAt: doc.openedAt,
      });
    }
  } catch (error) {
    console.error(`[agent] ingest failed for ${doc.path}:`, error);
  }
}

/** Open a file with its default Windows application. */
function openWithDefaultApp(path: string) {
  Bun.spawn(["cmd", "/c", "start", "", path], {
    stdout: "ignore",
    stderr: "ignore",
  });
}

// Resolve the user's default browser (Brave / Edge / Chrome / …) from the
// registry and open the file with it — Chromium browsers render almost anything.
const OPEN_IN_BROWSER_PS = `
try {
  $p = (Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\Shell\\Associations\\UrlAssociations\\https\\UserChoice' -ErrorAction Stop).ProgId
  $c = (Get-ItemProperty "Registry::HKEY_CLASSES_ROOT\\$p\\shell\\open\\command" -ErrorAction Stop).'(default)'
  $exe = ($c -split '"')[1]
  $uri = ([uri]$env:KOVA_FILE).AbsoluteUri
  Start-Process -FilePath $exe -ArgumentList $uri
} catch {
  Start-Process -FilePath $env:KOVA_FILE
}
`.trim();

function openWithBrowser(path: string) {
  Bun.spawn(
    ["powershell", "-NoProfile", "-NonInteractive", "-Command", OPEN_IN_BROWSER_PS],
    {
      env: { ...process.env, KOVA_FILE: path },
      stdout: "ignore",
      stderr: "ignore",
    },
  );
}

/** Consume the server→agent command stream (e.g. "open this file"). */
async function listenForCommands() {
  try {
    const commands = await client.commands({ machineId: MACHINE });
    for await (const command of commands) {
      if (command.type !== "open") continue;
      if (command.app === "browser") openWithBrowser(command.path);
      else openWithDefaultApp(command.path);
      console.log(`[agent] opened ${command.path} (${command.app})`);
    }
  } catch (error) {
    console.error("[agent] command stream error:", error);
  }
}

ws.addEventListener("open", async () => {
  try {
    await client.register({
      hostname: MACHINE,
      platform: process.platform,
      pid: process.pid,
    });
    console.log(`[agent] connected as ${MACHINE} (pid ${process.pid})`);
    heartbeat = setInterval(() => {
      client.heartbeat().catch(() => {});
    }, HEARTBEAT_MS);

    // Seed the version cache so unchanged files aren't re-sent / re-embedded.
    try {
      const known = await client.sync({ machineId: MACHINE });
      for (const k of known) {
        versionCache.set(
          k.path,
          k.lastModified ? new Date(k.lastModified).getTime() : 0,
        );
      }
      console.log(`[agent] synced ${known.length} known files`);
    } catch (error) {
      console.error("[agent] sync failed:", error);
    }

    stopWatch = watchRecent((doc) => void indexDoc(doc));
    void listenForCommands();
    console.log("[agent] watching documents + listening for commands…");
  } catch (error) {
    console.error("[agent] failed to register:", error);
    process.exit(1);
  }
});

ws.addEventListener("close", () => {
  console.log("[agent] disconnected from server");
  if (heartbeat) clearInterval(heartbeat);
  stopWatch?.();
  process.exit(0);
});

ws.addEventListener("error", (event) => {
  console.error("[agent] socket error:", event);
});

function shutdown() {
  console.log("\n[agent] shutting down…");
  if (heartbeat) clearInterval(heartbeat);
  stopWatch?.();
  ws.close();
  setTimeout(() => process.exit(0), 50);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`[agent] connecting to ${SERVER_WS_URL}…`);
