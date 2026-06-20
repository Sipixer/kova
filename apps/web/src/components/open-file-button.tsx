import {
  Check,
  ExternalLink,
  Globe,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

type App = "default" | "browser";
type Status = "idle" | "loading" | "done";

function OpenButton({
  documentId,
  machineName,
  app,
  label,
  icon: Icon,
}: {
  documentId: string;
  machineName: string;
  app: App;
  label: string;
  icon: LucideIcon;
}) {
  const [status, setStatus] = useState<Status>("idle");

  async function open() {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const { sent } = await client.openFile({ id: documentId, app });
      if (!sent) {
        setStatus("idle");
        return;
      }
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={status === "loading"}
      onClick={open}
      className={cn(
        "shrink-0 transition-colors",
        status === "done" && "border-primary/30 text-primary",
      )}
    >
      {status === "loading" ? (
        <>
          <Loader2 data-icon="inline-start" className="animate-spin" />
          Ouverture…
        </>
      ) : status === "done" ? (
        <>
          <Check data-icon="inline-start" className="animate-in zoom-in-50" />
          Ouvert sur {machineName}
        </>
      ) : (
        <>
          <Icon data-icon="inline-start" />
          {label}
        </>
      )}
    </Button>
  );
}

/** "Open" + "Open in browser" actions for a captured file on a live machine. */
export function OpenButtons({
  documentId,
  machineName,
}: {
  documentId: string;
  machineName: string;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <OpenButton
        documentId={documentId}
        machineName={machineName}
        app="default"
        label="Ouvrir"
        icon={ExternalLink}
      />
      <OpenButton
        documentId={documentId}
        machineName={machineName}
        app="browser"
        label="Navigateur"
        icon={Globe}
      />
    </div>
  );
}
