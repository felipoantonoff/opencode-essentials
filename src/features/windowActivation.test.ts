import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  type ActivationRunner,
  buildWindowActivationScript,
  parseParentPid,
  resolveAncestorPids,
  runWindowActivation,
  supportsWindowActivation,
} from "./windowActivation.ts"

describe("parseParentPid", () => {
  it("reads field 4 of a plain stat line", () => {
    assert.equal(parseParentPid("387526 (bash) S 3802 387526 387526 0"), 3802)
  })

  it("skips a process name containing spaces and parentheses", () => {
    assert.equal(parseParentPid("42 (weird (name) app) S 7 42"), 7)
  })

  it("rejects a line without a name terminator", () => {
    assert.equal(parseParentPid("42 bash S 7"), undefined)
  })
})

describe("resolveAncestorPids", () => {
  it("walks the parent chain to the root", () => {
    const parents = new Map<number, number>([
      [10, 20],
      [20, 30],
      [30, 1],
      [1, 0],
    ])
    const pids = resolveAncestorPids(
      (pid) =>
        parents.has(pid) ? `${pid} (app) S ${parents.get(pid)}` : undefined,
      10,
    )
    assert.deepEqual(pids, [10, 20, 30, 1])
  })

  it("stops at a missing stat line and refuses to loop", () => {
    const pids = resolveAncestorPids((pid) => `${pid} (x) S 5`, 5)
    assert.deepEqual(pids, [5])
  })
})

describe("buildWindowActivationScript", () => {
  it("embeds every candidate pid in the wanted list", () => {
    const script = buildWindowActivationScript([3802, 387526])
    assert.match(script, /var wanted = \[3802, 387526\];/)
    assert.match(script, /requestActivate\(\)/)
  })
})

describe("supportsWindowActivation", () => {
  it("recognizes KDE in the desktop list only", () => {
    assert.equal(supportsWindowActivation("KDE"), true)
    assert.equal(supportsWindowActivation("Unity:KDE"), true)
    assert.equal(supportsWindowActivation("GNOME"), false)
    assert.equal(supportsWindowActivation(undefined), false)
  })
})

function fakeRunner(overrides: Partial<ActivationRunner>) {
  const removed: string[] = []
  const runner: ActivationRunner = {
    ancestorPids: () => [3802, 387526],
    writeScript: () => {},
    callScripting: async () => {},
    removeScript: (path) => removed.push(path),
    scriptPathFor: (name) => `/tmp/${name}.js`,
    ...overrides,
  }
  return { runner, removed }
}

describe("runWindowActivation", () => {
  it("writes the script, runs the three busctl calls, and cleans up", async () => {
    const calls: string[] = []
    const { runner, removed } = fakeRunner({
      callScripting: async (member) => {
        calls.push(member)
      },
    })
    const ok = await runWindowActivation(runner, "opencode-per_test")
    assert.equal(ok, true)
    assert.deepEqual(calls, ["loadScript", "start", "unloadScript"])
    assert.deepEqual(removed, ["/tmp/opencode-per_test.js"])
  })

  it("reports no activation when the pid chain is empty and runs nothing", async () => {
    const { runner, removed } = fakeRunner({ ancestorPids: () => [] })
    const ok = await runWindowActivation(runner, "opencode-per_test")
    assert.equal(ok, false)
    assert.deepEqual(removed, [])
  })

  it("returns false and still cleans up when busctl is absent", async () => {
    const { runner, removed } = fakeRunner({
      callScripting: async () => {
        throw new Error("ENOENT busctl")
      },
    })
    const ok = await runWindowActivation(runner, "opencode-per_test")
    assert.equal(ok, false)
    assert.deepEqual(removed, ["/tmp/opencode-per_test.js"])
  })

  it("does not report failure when only the cleanup throws", async () => {
    const { runner } = fakeRunner({
      removeScript: () => {
        throw new Error("EPERM")
      },
    })
    assert.equal(await runWindowActivation(runner, "opencode-per_test"), true)
  })
})
