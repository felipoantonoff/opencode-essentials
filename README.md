# opencode-essentials

> **Work in progress.** Do not use this project. It is unpublished and
> unfinished, and its behavior may change or break at any commit.
>
> **Vibe coded.** Agents wrote this code because the project is low-stakes.
> The author nitpicked the result, and every review finding is fixed, but do
> not expect the care of hand-written code.

A suite of plugins for [OpenCode](https://opencode.ai), version 1. Server
plugins run the features; TUI plugins manage the switches, render a shared
status bar, and assist with permissions.

## Features

- **Idle Auto Compactor**: compacts a session after it stays idle for a
  while.
  - *Problem it solves:* a session left sitting overnight carries a bloated
    context into your next task.
- **Token Ceiling Compactor**: compacts a session once its context passes a
  token ceiling you pick.
  - *Problem it solves:* the model drifts and forgets the plan once the
    context window grows too large.
- **Idle Session Clock**: shows how long the open session has waited for
  your input.
  - *Problem it solves:* with several sessions open, you cannot tell which
    ones wait on you.
- **Permission Assistant**: lets a classifier model answer routine permission
  requests before they reach you.
  - *Problem it solves:* an unattended run stalls on every routine command
    that needs approval.
- **Permission Notifications**: raises a pending request as a desktop
  notification with allow actions on Linux.
  - *Problem it solves:* a prompt waits unseen behind a backgrounded
    terminal.
- **Reasoning Loop Guard**: cancels a model that keeps rewriting the same
  thought without progress.
  - *Problem it solves:* a model that spirals mid-reasoning burns tokens and
    time until you notice and abort it yourself.
- **Response Usage Status**: shows a provider health verdict and response
  speed in the shared status bar.
  - *Problem it solves:* "is my provider healthy?" has no visible answer
    while a response runs.
- **Embedded Skills and Commands**: adds `/grill`, `/humanizer`,
  `/web-search`, and `/agent-browser` with matching native skills.
  - *Problem it solves:* plan reviews, research, and rendered-UI checks each
    need a careful prompt every time you want one.
- **Exec Wrapper Guard**: checks the real inner command behind wrappers like
  `timeout` or `bash -c` against your permission rules.
  - *Problem it solves:* rules match the wrapper, not the command.

The toggles for every feature live in the `/essentials` dialog. The full
behavior of every feature, the status bar layout, and the audit logs are
documented in [src/README.md](src/README.md).

## Development

Requires Node 24+, Bun 1.3+, and OpenCode 1.18.x for manual testing.

```
npm install
cd .opencode
bun install
cd ..
npm run test:plugin
npm test          # node --test
npm run typecheck # tsc --noEmit
```

OpenCode also runs `bun install` in `.opencode` at startup.

Installation, configuration, and feature semantics live in
[`src/README.md`](src/README.md).
