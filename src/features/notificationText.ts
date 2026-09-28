const END_OF_OPTIONS = "--"

export function escapeNotificationMarkup(notificationText: string): string {
  return notificationText
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export type NotificationOutput = {
  notificationId: number | undefined
  action: string
}

// With --print-id, notify-send writes the numeric notification id as the
// first stdout line, then the activated action key as the next line.
export function parseNotificationOutput(raw: string): NotificationOutput {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (lines.length === 0) return { notificationId: undefined, action: "" }
  const first = lines[0] ?? ""
  if (/^\d+$/.test(first)) {
    return {
      notificationId: Number(first),
      action: lines.length > 1 ? (lines[lines.length - 1] ?? "") : "",
    }
  }
  return { notificationId: undefined, action: first }
}

export function buildPermissionNotificationArguments(
  notificationText: string,
  withFocusAction: boolean,
): string[] {
  return [
    "--app-name=OpenCode",
    "--wait",
    "--expire-time=0",
    "--print-id",
    "--action=allow=Allow once",
    "--action=always=Allow always",
    ...(withFocusAction ? ["--action=focus=Go to window"] : []),
    END_OF_OPTIONS,
    "OpenCode needs permission",
    escapeNotificationMarkup(notificationText),
  ]
}
