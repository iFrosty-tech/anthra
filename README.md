<div align="center">

# `>_` Anthra

**The terminal that opens already inside Claude Code.**

Open a directory and Claude Code is running. Beside it, a panel shows how much context
you are burning, what the session costs and which tab needs you.

<img src="screenshot.png" alt="Anthra with three tabs and their status, Claude Code in the terminal and the metrics panel on the right" width="100%">

</div>

This repository hosts Anthra's **releases**, its Scoop bucket and its website. Report bugs
and ideas in [Issues](https://github.com/iFrosty-tech/anthra/issues).

## Install

| How | Command or link | Updates |
| --- | --- | --- |
| **Installer** | [`Anthra-Setup-<version>-x64.exe`](https://github.com/iFrosty-tech/anthra/releases/latest) | By itself |
| **winget** | `winget install iFrosty-tech.Anthra` | By itself, or `winget upgrade` |
| **Scoop** | `scoop bucket add anthra https://github.com/iFrosty-tech/anthra`<br>`scoop install anthra` | `scoop update anthra` |
| **Portable** | [`Anthra-Portable-<version>-x64.exe`](https://github.com/iFrosty-tech/anthra/releases/latest) | Download the new one |

winget and Scoop are available from version 0.7.0, the first release published here.

Requirements: Windows 10 or 11, and [Claude Code](https://claude.com/claude-code) on your
`PATH`. The installer is per-user and needs no admin rights.

## Updates

The installed build checks for a new version 30 seconds after launch and every 6 hours,
downloads it in the background and installs it **when you quit** — or right away with
**Restart to update** in the tab bar. Your windows, tabs and chats are reopened
afterwards, and a *What's new* window lists what changed. The portable build and Scoop
installs show a button instead. Preferences → Updates switches the check off.

Updating from 0.6 or earlier has to be done by hand once: those versions have no updater.

## Privacy

Anthra reads local files only: Claude Code's transcripts under `~/.claude`, the git
status of each tab's directory and its own state in `%APPDATA%\Anthra`. The one request
it makes on its own is the update check to `github.com`, which sends nothing beyond what
any download does (your IP address and a user agent). No telemetry, no analytics, no
account.

## FAQ

**Why does SmartScreen warn me?**
Anthra is not code-signed yet, and SmartScreen warns about unsigned downloads it has not
seen often. winget, Scoop and Anthra's own updates do not go through SmartScreen. To
check a download, compare its SHA-512 with the `sha512` in that release's `latest.yml`:

```powershell
[Convert]::ToBase64String([Security.Cryptography.SHA512]::Create().ComputeHash([IO.File]::ReadAllBytes("$PWD\Anthra-Setup-<version>-x64.exe")))
```

**Are the costs what I will be billed?**
No, they are estimates from a local rate table. On a subscription they are the
API-equivalent cost of what you used.

**How do I remove Anthra completely?**
Uninstall it from Windows Settings (or `winget uninstall iFrosty-tech.Anthra`,
`scoop uninstall anthra`), then delete `%APPDATA%\Anthra`. Anthra never writes to
Claude Code's own configuration.
