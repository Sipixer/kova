import { watch } from "node:fs";
import { homedir } from "node:os";
import { extname, join } from "node:path";

export const RECENT_DIR = join(
  process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"),
  "Microsoft",
  "Windows",
  "Recent",
);

// Resolve every Recent *.lnk to its target path + last-opened time (epoch ms).
const SCAN_PS = `
$ErrorActionPreference='SilentlyContinue'
$recent=[Environment]::GetFolderPath('Recent')
$sh=New-Object -ComObject WScript.Shell
$epoch=[datetime]'1970-01-01'
$items = Get-ChildItem $recent -Filter *.lnk | ForEach-Object {
  $t=$sh.CreateShortcut($_.FullName).TargetPath
  if ($t) { [PSCustomObject]@{ path=$t; openedAt=[int64](($_.LastWriteTimeUtc - $epoch).TotalMilliseconds) } }
}
ConvertTo-Json -Compress -InputObject @($items)
`.trim();

export type RecentDoc = { path: string; openedAt: number };

/** Snapshot of recently-opened supported documents, newest first. */
export async function scanRecent(): Promise<RecentDoc[]> {
  const proc = Bun.spawn(
    ["powershell", "-NoProfile", "-NonInteractive", "-Command", SCAN_PS],
    { stdout: "pipe", stderr: "ignore" },
  );
  const out = await new Response(proc.stdout).text();
  await proc.exited;

  if (!out.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(out);
  } catch {
    return [];
  }
  const arr = (Array.isArray(data) ? data : [data]) as RecentDoc[];
  // Keep files (anything with an extension), drop folders / shell items.
  return arr
    .filter((d) => d?.path && extname(d.path) !== "")
    .sort((a, b) => b.openedAt - a.openedAt);
}

/**
 * Watch the Recent folder and call `onOpen` for each newly-opened document.
 * On start, emits the `backlog` most-recent docs so there's immediate data,
 * then emits live opens as they happen.
 */
export function watchRecent(
  onOpen: (doc: RecentDoc) => void,
  { backlog = 8 }: { backlog?: number } = {},
) {
  const seen = new Map<string, number>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let primed = false;

  const rescan = async () => {
    const docs = await scanRecent();
    const fresh = docs.filter((d) => {
      const prev = seen.get(d.path);
      return prev === undefined || d.openedAt > prev;
    });
    for (const d of docs) seen.set(d.path, d.openedAt);

    const toEmit = primed ? fresh : fresh.slice(0, backlog);
    primed = true;
    for (const d of toEmit) onOpen(d);
  };

  rescan();

  const watcher = watch(RECENT_DIR, { persistent: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rescan, 800); // debounce bursts
  });

  return () => {
    clearTimeout(timer);
    watcher.close();
  };
}
