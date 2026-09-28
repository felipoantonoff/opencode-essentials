import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildPermissionNotificationArguments,
  escapeNotificationMarkup,
  parseNotificationOutput,
} from "./notificationText.ts"

describe("escapeNotificationMarkup", () => {
  it("shows command text without treating it as notification markup", () => {
    assert.equal(
      escapeNotificationMarkup(
        "<a href='https://example.test'>allow</a> & run",
      ),
      "&lt;a href='https://example.test'&gt;allow&lt;/a&gt; &amp; run",
    )
  })

  it("escapes existing entities before the notification parser reads them", () => {
    assert.equal(
      escapeNotificationMarkup("&lt;link&gt;"),
      "&amp;lt;link&amp;gt;",
    )
  })

  it("keeps untrusted body text after the end-of-options marker", () => {
    assert.deepEqual(
      buildPermissionNotificationArguments(
        "--action=allow=Do not allow",
        false,
      ),
      [
        "--app-name=OpenCode",
        "--wait",
        "--expire-time=0",
        "--print-id",
        "--action=allow=Allow once",
        "--action=always=Allow always",
        "--",
        "OpenCode needs permission",
        "--action=allow=Do not allow",
      ],
    )
  })

  it("offers the go-to-window action only when the caller enables it", () => {
    const withFocus = buildPermissionNotificationArguments("ls", true)
    const withoutFocus = buildPermissionNotificationArguments("ls", false)
    assert.ok(withFocus.includes("--action=focus=Go to window"))
    assert.ok(!withoutFocus.some((arg) => arg.startsWith("--action=focus")))
  })
})

describe("parseNotificationOutput", () => {
  it("extracts the notification id and the activated action", () => {
    assert.deepEqual(parseNotificationOutput("4\nallow\n"), {
      notificationId: 4,
      action: "allow",
    })
  })

  it("extracts only the id when no action was activated", () => {
    assert.deepEqual(parseNotificationOutput("7\n"), {
      notificationId: 7,
      action: "",
    })
  })

  it("treats a non-numeric first line as the action", () => {
    assert.deepEqual(parseNotificationOutput("allow\n"), {
      notificationId: undefined,
      action: "allow",
    })
  })

  it("returns empty fields for empty output", () => {
    assert.deepEqual(parseNotificationOutput(""), {
      notificationId: undefined,
      action: "",
    })
  })
})
