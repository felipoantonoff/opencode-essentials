import path from "node:path"
import { sanitizeText } from "../log.ts"
import { resolveEssentialsStatePath } from "../state.ts"
import type { OpenRouterModelId } from "../valueObject/openRouterModelId.ts"
import type { SessionId } from "../valueObject/sessionId.ts"
import { writeAuditRecord } from "./logRotation.ts"

// The verdict the classifier returned for one spiral check. `confirmed` is
// the spiraling signal the operator reads; the guard's downstream action
// (interrupt, give up, escalate) is logged separately by the server log.
export type ReasoningLoopVerdictOutcome =
  | "cleared"
  | "confirmed"
  | "stale"
  | "failed"

const MAX_AUDIT_PHRASE_CHARS = 200

export function resolveReasoningLoopAuditLogPath(): string {
  return path.join(
    path.dirname(resolveEssentialsStatePath()),
    "reasoning-loop-audit.log",
  )
}

// One line per Jev spiral check, so the request volume and the probability
// spread answer "is this model spiraling?" without a live terminal. The
// phrase is the repeated tail that triggered the check, shortened so a
// pathological loop cannot grow the log with megabytes of the same text.
export function auditReasoningLoopCheck(input: {
  sessionId: SessionId
  model: OpenRouterModelId
  probability: number | undefined
  outcome: ReasoningLoopVerdictOutcome
  phrase: string
}): unknown {
  return writeAuditRecord(resolveReasoningLoopAuditLogPath(), {
    time: new Date().toISOString(),
    session: input.sessionId,
    model: input.model,
    probability: input.probability ?? null,
    outcome: input.outcome,
    phrase: sanitizeText(input.phrase, MAX_AUDIT_PHRASE_CHARS),
  })
}
