import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

/** Live list of connected machines — re-renders on every connect/disconnect. */
export function useMachines() {
  return useQuery(orpc.machines.live.experimental_liveOptions());
}

export function platformLabel(platform: string) {
  switch (platform) {
    case "win32":
      return "Windows";
    case "darwin":
      return "macOS";
    case "linux":
      return "Linux";
    default:
      return platform;
  }
}
