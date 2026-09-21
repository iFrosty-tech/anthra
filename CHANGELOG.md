# Changelog

All notable changes to Anthra. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[semantic versioning](https://semver.org/). Each section is also the body of its
GitHub release and what the "What's new" window shows after an update.

## [0.11.1] — 2026-09-21

*"Answering from the conversation."*

### Added
- **Answer Claude Code without leaving the conversation.** When Claude asks for something, a card
  appears at the end of the turn and the tab stays where it is.
  - **Permissions**: what Claude wants to do — the command with its description, the diff an *Edit*
    or *Write* would make, the page it wants to read, the input of any other tool — with *Allow*,
    the "always allow" options Claude Code itself suggests (for this session, in this project, in
    every project), *Deny* and *Deny and stop Claude*.
  - **Questions**: the options of `AskUserQuestion` to click, one answer or several, and *Other* for
    an answer of your own.
  - **Plans**: the plan in markdown with *Approve and accept edits*, *Approve* and *Keep planning*,
    with an optional note on what should change.
  - **From the keyboard**: the card takes the focus when its tab is the one in front; `1`–`9` pick a
    choice, `Enter` the first one, `Esc` declines. With a draft in the composer the focus stays there
    and `Shift+Tab` takes you to the card; what you write waits until the request is answered.
- **The terminal stays the fallback.** Claude Code's own dialog stays open in the terminal the whole
  time a card waits, and the first answer counts, from either side. *Answer in the terminal* takes
  you there and brings you back afterwards. Anthra never answers on its own: a closed tab, an error
  or an unreadable request leave the decision to the terminal, exactly as in 0.11.0. Cards need
  Claude Code 2.1.278 or later.
- **Preferences → Conversation → Answer Claude Code from the conversation**, on by default. Off,
  every request goes to the terminal as before.

### Changed
- The tab turns to *waiting* the moment Claude asks, not seconds later, and the Windows notification
  says what is being asked: the command, the file, the question.
- A tool call you denied, or a question you left unanswered, reads "denied", "sent back" or "not
  answered" in the conversation instead of showing as a failure.

## [0.11.0] — 2026-09-21

*"A terminal you can read."*

### Added
- **The session as a conversation.** Every tab now has two views over the same live session: the
  conversation and the terminal. `Ctrl+Shift+J`, the selector in the header or the tab's menu
  switch between them, and new tabs open on the conversation. Claude Code keeps running in its own
  terminal underneath the whole time — the conversation is a lens on it, built from the transcript
  Anthra already reads, never a client of its own.
  - **A card per turn and per tool**: your prompt, the answer in markdown, and what Claude did.
    *Edit* and *Write* with the diff, line numbers and `+N −M`; a click on the path opens the diff
    viewer. *Bash* with the command, how long it took, how it ended and the last lines of its
    output. Reads, greps and globs take a line each and gather into one row when they follow one
    another. Subagents, task lists, web fetches and MCP tools have their own rows, and a tool that
    fails says why.
  - **Live**: a card appears when its tool starts, with a stopwatch, and completes when it does;
    while a turn runs, a line at the bottom says `Working… · Esc interrupts · 6.2s`. The view stays
    at the end unless you scroll up, and then a "↓ new messages" button brings you back.
  - **Resuming a chat** shows the last 30 turns, with "load earlier turns" at the top; compactions,
    `/clear`, model and permission-mode changes are separators in the flow.
- **A composer under the conversation.** A real multi-line field: `Enter` sends, `Shift+Enter` goes
  to a new line. `/` opens the commands — Claude Code's own, plus the project's, yours and those of
  your plugins, with their description — and `@` the files of the project; `↑` and `↓` on an empty
  field walk the prompts of the session. `Esc`, `Shift+Tab` and `Ctrl+C` go to Claude Code as the
  keys they are. Files dropped or pasted become their paths, as in the terminal, and a counter
  estimates the tokens of what you have written.
  - What the composer sends is **typed, never pasted**: Claude Code receives exactly what you wrote,
    so a long prompt arrives whole instead of as an attachment.
- **The terminal when it's needed.** The tab moves to the terminal by itself when Claude Code asks
  something only its own screen can show — a permission, a question, a plan to approve, an
  interactive command like `/model` sent from the composer — and it takes the keyboard with it. When
  the prompt comes back, the tab returns to the conversation **if it went there on its own**: a
  terminal you chose stays. A line in the conversation says what was asked and that it was answered
  there. **Preferences → Conversation** turns the whole thing off.
- **A frame around the session.** Above the view, the model, the permission mode, how long the
  session has been going and the context used; below it, the shortcuts of the view you are on. Hide
  it in **Preferences → Appearance**.
- **Preferences → Conversation**: which view new tabs open on, and whether the terminal may come
  forward by itself.

### Changed
- Claude Code's own colours are now readable on the light theme: what it draws keeps its meaning
  instead of fading into the background.
- `Shift+Enter` in the terminal goes to a new line, as Claude Code expects.
- Line numbers in a diff are readable on all three themes, in the conversation and in the diff
  viewer.

### Fixed
- Claude Code 2.1.278 no longer offers `esc to interrupt` while it works, which left the tab's dot,
  the taskbar and the panel thinking every turn was over as soon as it started. Anthra now reads the
  spinner over the prompt box.

## [0.10.0] — 2026-09-19

### Added
- **A panel of your own.** Drag the panel's left edge to make it wider or narrower, up to 640 px
  or half the window; double click for the default width. The edge also takes the arrow keys
  and `Home`. The wider the panel, the more the charts show: values under the charts, then the
  context beside its breakdown and the plan limits side by side.
- **Order and sections.** Drag a section by its title to move it, or `Alt+↑/↓` on the title. A
  click on the title collapses the section to one line that still shows its value (`42%`,
  `$3.10`). A right click on it collapses, hides or moves it, or hides the whole panel.
  **Preferences → Panel** lists every section, to reorder with a drag or the arrows, show or
  hide, and **Restore the panel** to its default width, order and sections. It all comes back
  on the next launch.
- **New sections:**
  - **Context over time**: the context used after each turn, the auto-compact threshold and every
    compaction, with a forecast of the next one ("in ~4 turns"). A click opens the timeline.
  - **Budget and models**: today's cost against your daily cost alert, the pace of the last hour
    and the time you will reach the alert at that pace; today's cost by model; what the prompt
    cache saved you today.
  - **Turn rhythm** (hidden at first): the last 20 turns as bars, height for duration and colour
    for cost, with the slowest and the priciest marked. A click on a bar opens that turn in the
    timeline.
  - **Session tools** (hidden at first): the five tools the chat used most, MCP tools by their
    short name.
  - **Plan limits** for Pro and Max: the five-hour session and the week, with when each resets,
    as `/usage` shows them. Anthra reads them from what Claude Code hands its status line and runs
    your own status line as before; turn it off in Preferences → Panel. The section stays out of
    sight with an API key or when Claude Code does not report the limits.
- **Show or hide the panel** with the new button in the title bar, besides `Ctrl+Shift+B`; the
  choice is kept across launches.

### Changed
- The panel **moves** with what it shows: the context ring and the bars glide to their new
  values, the context line draws on and the turn bars slide over when a turn ends, sections
  glide into place when you reorder them and open and close smoothly, and the panel slides in
  and out. With Windows' animation effects off everything changes at once.
- The cost block has a title, **Cost**, so it can be collapsed and moved like the others.
- The panel width moved from Preferences → Appearance to Preferences → Panel.

### Fixed
- A folder opened through its short 8.3 path (`C:\Users\JOHNDO~1\…`, as `%TEMP%` often is) left
  the panel empty: Claude Code files the chat under the long path. Anthra now expands it first.

## [0.9.0] — 2026-09-18

### Added
- **Timeline of a session.** `Ctrl+Shift+H`, a click on the cost curve in the panel or
  *Timeline* in a tab's menu shows one row per turn: when it started, the start of the prompt,
  how long it took, what it cost, the tools it used, the files it wrote and its errors. Between
  the turns: compactions with the tokens before them, model and permission mode changes, and
  long pauses. It follows the tab live; a row opens the turn in full, with the whole prompt, every
  tool call and its outcome, and the diff of each file. The ≡ button on a recent chat opens the
  timeline of a chat that is not open anywhere, read-only, with **Resume**.
- **Search every chat.** `Ctrl+Shift+F` searches the prompts, the answers, the titles and the
  tool calls of every chat in every project, as you type. Accents do not matter, `"quotes"`
  match a phrase and `-word` leaves it out; filters for the project (the tasks count with their
  repository), the period and the kind. `Enter` opens the timeline at that turn,
  `Ctrl+Enter` resumes the chat.
- **Cost analysis.** `Ctrl+Shift+K`, or *Analysis…* in the panel, shows what you spent over
  7, 30 or 90 days, this month or ever, by project, by model or by week, with a weekly chart.
  A project opens into its models. **Export** to CSV or JSON through the Windows save dialog;
  the CSV uses the list separator and decimal symbol of your Windows regional settings, so Excel
  opens it in columns, and chat titles stay out of the file unless you ask for them.
- **Two sessions side by side.** `Ctrl+Shift+D` splits the window: the tab you used last goes
  on the right, or a new one in the same folder. `Ctrl+Shift+←/→` or a click moves between the
  two, the divider drags from a quarter to three quarters (double click for half and half), and
  *Open on the right* in a tab's menu puts that tab there. Each side has its own status bar; the
  panel and the title follow the side you are working on. A window too narrow for two keeps one
  side and brings the other back once there is room, and the split comes back on the next launch.
- **Subagents' costs** count in today's and this month's totals, in the history and in the chat
  that started them; the panel shows their share.
- **Preferences → History**: switch the index off, see what it holds and clear its cache.

### Changed
- The totals, the history and the recent chats come from **one index for the whole app**, built
  in the background and kept in a cache, instead of every tab reading every transcript every
  30 seconds. The first launch reads them all once; afterwards only what changed. Typing in
  the terminal stays smooth while it works.
- A turn that finishes in the side of the window you are not working on is not marked as unread
  and sends no toast: it is on screen.
- The metrics panel shows and hides with **`Ctrl+Shift+B`**. Plain `Ctrl+B` now reaches Claude
  Code, which uses it to send a running command to the background.


### Fixed
- **Costs were counted more than once.** Claude Code writes each response as one record per
  block (thinking, text, each tool call), all carrying the same usage, and Anthra added every
  record: costs and tokens came out about 2.4 times too high. Each response now counts once,
  so the numbers in the panel drop — they now match what `/cost` says, a little under it
  because a few calls (the chat title, retried requests) never reach the transcript. The
  daily cost alert keeps the threshold you chose: it now fires later, at the right time.
- The cost sparkline shows the cost of each **turn** — a prompt and all the work it caused —
  instead of each single record.
- A chat without a title no longer shows up in **Recent chats** as
  "[Request interrupted by user…]": the first prompt you actually wrote names it.

## [0.8.0] — 2026-09-17

### Added
- **Tasks: parallel work on one repository.** `Ctrl+Shift+N`,
  **+ Task** in the panel or *New task from here* in a tab's menu opens a tab on a new git
  worktree in `<repository>.worktrees\<name>`, on the branch `anthra/<name>`. The repository
  you started from keeps its branch and its changes, and its panel lists the open tasks.
- **Closing a task** from the panel or the tab's menu: **merge** (fast-forward when it can, a
  merge commit otherwise, into whichever folder has the base checked out), **pull request**
  through the GitHub CLI — with *Keep the folder* to leave the task open for the review — or
  **discard**, behind a confirmation that counts the commits and changes being thrown away.
  Merges are blocked while anything is uncommitted, a conflict undoes itself, and the branch
  survives everything but a discard. If a program still holds the folder, the task stays and
  **Retry** finishes the removal.
- **Git status on every tab**: the branch for a task, commits ahead of and behind the base,
  and a dot while something is uncommitted. It refreshes at the end of each turn, when a tab
  is opened and once a minute, so background tabs cost nothing to watch.
- **Touched files** in the panel, from what Claude edited and from git, with `+`/`−` counts;
  a click opens the **diff** since the tab started — including work Claude has already
  committed. Binary and oversized files say so and open in your editor instead.
- **Preferences → Tasks**: the branch prefix for new tasks, and the git marks on the tabs.

### Fixed
- Windows toasts follow the language the windows are in. With an English Windows and Italian
  regional settings, the windows were Italian and the toasts English.

## [0.7.2] — 2026-09-17

### Changed
- **Preferences** is wider and split into sections — General, Appearance, Notifications,
  Alerts and Updates — so every setting fits without scrolling. It reopens on the last
  section you used, and the arrow keys move between sections.
- The selected section's highlight glides to the next one and each panel slides in from the
  direction you moved; the Preferences and What's new windows fade in and out. With Windows
  animation effects turned off, only short fades remain.
- Update checks never expect a web installer, since releases always ship the full one.

## [0.7.1] — 2026-09-17

### Fixed
- The **What's new** window shows a version's introductory notes, such as how to update,
  not only its lists of changes.
- An update check against a repository with no published release yet no longer shows as a
  failed check in Preferences → Updates.

## [0.7.0] — 2026-09-17

**Updating from 0.6 or earlier:** download and run this installer once by hand. From 0.7.0 on,
Anthra updates itself.

### Added
- **Automatic updates** for the installed build: Anthra checks GitHub on launch and every
  6 hours, downloads the new version in the background and installs it when you quit, or
  right away with **Restart to update**. Your tabs and chats are reopened afterwards.
- The portable build and Scoop installs tell you when a new version is out instead.
- A **What's new** window after an update, also reachable from Preferences → Updates.
- Preferences → Updates: switch the update check off, check now, see the last result.

### Changed
- `Anthra.exe` carries its product name, version and copyright, so Task Manager shows
  "Anthra" instead of "Electron".

## [0.6.0] — 2026-09-16

### Added
- **Resume a chat in one click**: every entry in *Recent chats* reopens in a new tab, in its
  own directory, with `claude --resume`. A chat already open in some tab brings that tab
  forward instead. The list now shows each chat's folder.
- **Session restore**: on launch Anthra reopens your windows, tabs in their order, their names
  and the chat each one was on. Opening Anthra on a directory skips the restore. Can be
  switched off in Preferences → Session.
- **Jump list**: right-click Anthra on the taskbar for your recent projects and *New tab*.
- **Rename tabs**: double-click a tab's name. The name shows in the title bar and in toasts,
  and is restored on launch.
- **Drag & drop**: drop files or images on the terminal and their paths are typed into the
  prompt, quoted, without pressing Enter.
- **Alerts**: a toast when a chat's context passes 80%, and once a day when today's
  API-equivalent cost passes $20. Both thresholds are configurable in Preferences → Alerts.

### Changed
- With Anthra already running, "Open in Anthra" and the jump list open a tab in the window
  you used last instead of a new window.
- Costs ("today", the month and the 14-day history) are counted by your **local** calendar
  day instead of UTC, so the numbers you saw before may shift slightly.

### Fixed
- A new tab's panel no longer stays empty until its transcript changes.

## [0.5.0] — 2026-09-16

### Added
- **Tab status dot**: pulsing while Claude works, amber while it waits for your permission,
  accent when a turn finished in a tab you weren't looking at.
- **Windows toasts** when Claude asks for permission, or finishes a turn longer than 20 s, in
  a tab you're not looking at. Clicking a toast brings the window forward on that tab.
- **Taskbar**: an amber badge and a flash while a tab is waiting, and the active tab's context
  as the progress bar.
- Preferences → Notifications: each toast on or off, minimum turn length, sound, taskbar
  progress bar.

### Fixed
- A new tab no longer shows another terminal's session before its first prompt.

## [0.4.2] — 2026-09-16

### Fixed
- The new app icon is actually embedded in the exe and the installer.

## [0.4.1] — 2026-09-16

### Changed
- New app icon for the exe and the installer.

## [0.4.0] — 2026-09-16

### Added
- Preferences panel: theme, font, terminal font size, panel width, language.
- Badge for the current permission mode next to the model name.
- UI locales: English, Italian.
- Cost history beyond the current day in the metrics panel.

## [0.2.0] — 2026-09-16

### Added
- **Multiple tabs**, each with its own terminal, Claude Code session and metrics.
- **"Open in Anthra" in the Explorer context menu**, on a folder, inside a folder and on a
  drive. The portable build registers it with `--register-shell`.

### Fixed
- The session panel could stay at 0 tokens and $0.00 for a whole session.
- The context window is 1M only when the model setting opts into it, otherwise 200k.
- Fast mode and US-only inference are billed at their premium rates.
- Long chat titles no longer overflow the panel.

## [0.1.0] — 2026-09-15

### Added
- PowerShell on ConPTY, with `claude` started automatically in the directory you open.
- Live panel: context usage, token breakdown, cache hit rate, session and daily cost, git
  status, recent chats.
- `ctrl+B` hides the panel.
- `anthra .` or `anthra D:\repo` opens a specific directory.
