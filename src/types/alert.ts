import type { SupportedChain } from "@/types/transaction";

export type AlertSeverity = "info" | "warning" | "critical";

export interface UiAlert {
  id: string;
  chain: SupportedChain;
  message: string;
  severity: AlertSeverity;
  createdAt: string;
}
