import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  countPermissionDecision,
  readPermissionHandlingCounts,
} from "./permissionHandlingCounts.ts"

describe("permission handling counts", () => {
  it("counts classifier and cache replies as auto-handled within the total", () => {
    const start = readPermissionHandlingCounts()
    countPermissionDecision("classifier")
    countPermissionDecision("cache")
    countPermissionDecision("user")
    countPermissionDecision("assistant")

    const after = readPermissionHandlingCounts()
    assert.equal(after.autoHandled - start.autoHandled, 2)
    assert.equal(after.total - start.total, 4)
  })

  it("hands back a copy, not the live tally", () => {
    const snapshot = readPermissionHandlingCounts()
    const before = snapshot.total
    countPermissionDecision("user")
    assert.equal(snapshot.total, before)
  })
})
