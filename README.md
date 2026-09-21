<div align="center">

# `>_` Anthra

**A terminal you can read.**

Open a directory and Claude Code is running. Every tab has two views on that same live
session — a conversation, turn by turn, and the terminal underneath it — plus a panel
that shows how much context you are burning, what the session costs, your plan limits
and which tab needs you.

<img src="screenshot.png" alt="Anthra showing the conversation view of a session, with cards for Claude's turns and tool calls, and the metrics panel on the right" width="100%">

</div>

This repository hosts Anthra's **releases**, its Scoop bucket and its website. Report bugs
and ideas in [Issues](https://github.com/iFrosty-tech/anthra/issues).

## Features

- **Conversation view**, alongside the terminal — `Ctrl+Shift+J`, the header selector or
  the tab menu switch between them, and new tabs open on the conversation. Claude Code
  keeps running in its terminal underneath the whole time: the conversation is a lens on
  that session, not a client of its own. A card per turn and per tool — *Edit* and *Write*
  with their diff and `+N −M`, *Bash* with its command, duration and outcome, reads and
  greps grouped when they run in a row — live, appearing with a timer the moment a tool
  starts; resuming a chat shows the last 30 turns, with *load earlier turns* at the top.
  Preferences → Conversation sets which view new tabs open on; Preferences → Appearance
  hides the session frame above the view and that view's shortcuts below.
- **Answer Claude Code from the conversation**: when Claude asks for a permission, a
  question or a plan to approve, a card appears at the end of the turn and the tab stays
  where it is. Permissions show what Claude wants to do — the command with its
  description, the diff an Edit/Write would make, the page it wants to read, or any other
  tool's input — with *Allow*, the "always allow" options Claude Code itself suggests,
  *Deny* and *Deny and stop Claude*. Questions let you click one answer or several, or
  *Other* for your own. Plans offer *Approve and accept edits*, *Approve*, or
  *Keep planning* with an optional note on what should change. `1`–`9` pick a choice,
  `Enter` picks the first, `Esc` declines; with a draft in the composer, `Shift+Tab` goes
  to the card and the draft waits. Claude Code's own dialog stays open in the terminal the
  whole time, so the first answer, from either side, counts; *Answer in the terminal*
  takes you there and back. When a request is answered on the terminal instead, the
  conversation still keeps a line for what was asked and how it was answered there.
  Anthra never answers on its own: a closed tab, an error or an unreadable request leave
  the decision to the terminal. Cards need Claude Code 2.1.278 or later; older versions,
  interactive commands like `/model` sent from the composer, and Preferences →
  Conversation → *Answer Claude Code from the conversation* switched off (on by default)
  route the request to the terminal instead, which then takes the keyboard with it if
  *Show the terminal when Claude Code asks something* — the existing, separate toggle in
  the same section — is on, the tab going back to the conversation only if it got there
  on its own.
- **Composer** under the conversation: `Enter` sends, `Shift+Enter` starts a new line, `/`
  opens commands and skills — Claude Code's own, the project's, yours and plugins', each
  with its description — and `@` opens the project's files. `↑`/`↓` on an empty field
  scroll through the session's past prompts, and `Esc`, `Shift+Tab` and `Ctrl+C` reach
  Claude Code as the keys they are. Dropped or pasted files become their path, as in the
  terminal, and a counter estimates the tokens of what you typed. What the composer sends
  is typed, never pasted — Claude Code gets exactly what you wrote, so a long prompt
  arrives whole instead of as an attachment — though an image from the clipboard still
  needs the terminal, since the composer does not accept it.
- **Live panel** for context, token breakdown, cost and plan limits (Pro and Max), resizable
  and rearrangeable — sections reorder, show or hide from Preferences → Panel (or drag by
  title / Alt+↑/↓); a click on a section title folds it.
- **Tasks**: `Ctrl+Shift+N` opens a tab on a new git worktree and branch, so two Claude Code
  sessions can work on the same repository without conflicts. Closing a task merges it, opens
  a pull request through the GitHub CLI, or discards it.
- **Git status** on every tab — the branch of a task, commits ahead/behind, and a mark while
  something is uncommitted — and a diff of every file touched since the tab started.
- **Timeline** (`Ctrl+Shift+H`) of a session, turn by turn, with Resume for closed chats.
- **Search** (`Ctrl+Shift+F`) across every chat, with phrases, exclusions and filters.
- **Cost analysis** (`Ctrl+Shift+K`) by project, model or week, exportable to CSV or JSON.
- **Split pane** (`Ctrl+Shift+D`): two tabs side by side, restored on next launch.

## Install

| How | Command or link | Updates |
| --- | --- | --- |
| **Installer** | [`Anthra-Setup-<version>-x64.exe`](https://github.com/iFrosty-tech/anthra/releases/latest) | By itself |
| **Scoop** | `scoop bucket add anthra https://github.com/iFrosty-tech/anthra`<br>`scoop install anthra` | `scoop update anthra` |
| **Portable** | [`Anthra-Portable-<version>-x64.exe`](https://github.com/iFrosty-tech/anthra/releases/latest) | Download the new one |
| **winget** — coming soon | `winget install iFrosty-tech.Anthra`, once Anthra is in the winget repository | By itself, or `winget upgrade` |

Scoop is available from version 0.7.0, the first release published here. winget is coming soon:
Anthra is not in the winget repository yet.

Requirements: Windows 10 or 11, and [Claude Code](https://claude.com/claude-code) on your
`PATH`. The installer is per-user and needs no admin rights. Tasks need git on your
`PATH`; opening a pull request from a task needs the [GitHub CLI](https://cli.github.com),
logged in.

## Updates

The installed build checks for a new version 30 seconds after launch and every 6 hours,
downloads it in the background and installs it **when you quit** — or right away with
**Restart to update** in the tab bar. Your windows, tabs and chats are reopened
afterwards, and a *What's new* window lists what changed. The portable build and Scoop
installs show a button instead. Preferences → Updates switches the check off. Every
release is described in [`CHANGELOG.md`](CHANGELOG.md).

Updating from 0.6 or earlier has to be done by hand once: those versions have no updater.

## Privacy

Anthra runs on your machine; it writes to your repositories only when you start or close a
task, and goes online on its own only for the update check. Choosing an "always allow"
option on a permissions card makes Claude Code, not Anthra, save that rule in its own
settings, which can be inside the repository's `.claude` folder. It reads Claude Code's
transcripts under `~/.claude`, the git status of each tab's directory and its own state in
`%APPDATA%\Anthra`, which also holds
a history index cache (`history-cache`) with the text of your prompts, Claude's answers
and the names and targets of the tool calls — never what the tools returned. Switching
it off in Preferences → History deletes the cache. The `/` menu in the composer reads the
name and description of the project's, your own and enabled plugins' commands and skills
(under `~/.claude` and the project's own `.claude`); the `@` menu lists the project's
files with `git ls-files`, or a shallow walk of the directory when it is not a repository.
Both read-only: nothing runs, nothing leaves the machine.

For tasks, Anthra creates git worktrees and branches and runs merges in your
repositories; it pushes a branch and opens a pull request only when you ask it to, when
closing a task, through the GitHub CLI (`gh`).

In its own tabs, Anthra always passes Claude Code its own hooks through a settings file of
its own — they report tab state and notifications, and carry back the answer you give on
a permissions, question or plan card. For plan limits it also adds a status
line, on by default; switch it off in Preferences → Panel, which removes only the status
line, for tabs opened from then on. Both the hooks and the status line send data only to `127.0.0.1` — the loopback
address, local to your machine, never off it — and your own status line, if you have one,
still runs alongside it. Anthra only reads your Claude Code settings files, and never
writes to them; the "always allow" rules you choose from a card are written by Claude
Code itself, exactly as if you had chosen them in its own dialog.

The one request it makes on its own is the update check to `github.com`, which sends
nothing beyond what any download does (your IP address and a user agent); `gh` runs only
when you explicitly close a task as a pull request. No telemetry, no analytics, no
account.

## FAQ

**Why does SmartScreen warn me?**
Anthra is not code-signed yet, and SmartScreen warns about unsigned downloads it has not
seen often. Scoop and Anthra's own updates do not go through SmartScreen, and neither
will winget once Anthra is there. To
check a download, compare its SHA-512 with the `sha512` in that release's `latest.yml`:

```powershell
[Convert]::ToBase64String([Security.Cryptography.SHA512]::Create().ComputeHash([IO.File]::ReadAllBytes("$PWD\Anthra-Setup-<version>-x64.exe")))
```

**Are the costs what I will be billed?**
No, they are estimates from a local rate table. On a subscription they are the
API-equivalent cost of what you used. Since version 0.9.0 they also match what `/cost`
reports inside Claude Code.

**How do I remove Anthra completely?**
Uninstall it from Windows Settings (or `scoop uninstall anthra`), then delete
`%APPDATA%\Anthra`. Anthra never writes to
Claude Code's own configuration; "always allow" rules chosen from a card live in Claude
Code's own settings (the repository's `.claude` or `~/.claude`) and stay after Anthra is
gone. Closing a task removes its folder unless you keep it
when opening a pull request. What can stay in your repositories are the folders of
tasks still open or kept, in `<repository>.worktrees\<name>`, and the task branches —
`anthra/*` by default — since only a discard deletes one. Remove the folders with
`git worktree remove`, then the branches with `git branch -D`.
