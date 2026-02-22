# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-22

### Added

- Multi-client support in `init` wizard — auto-detects and configures:
  - Claude Code (`.mcp.json`)
  - Claude Desktop (`claude_desktop_config.json`)
  - Cursor (`~/.cursor/mcp.json`)
  - Windsurf (`~/.codeium/windsurf/mcp_config.json`)
- "All detected" option to configure every installed client at once
- "Skip" option with manual config output and file path reference
- Client-specific next steps shown after setup

## [1.1.0] - 2026-02-22

### Added

- Interactive CLI setup wizard (`npx @quadslab.io/discord-mcp init`)
  - Guided bot creation with step-by-step instructions
  - Live token validation with masked input
  - Auto-generated invite URL with all required permissions
  - Server auto-discovery and selection
  - Automatic `.mcp.json` generation with merge support
- Health check command (`npx @quadslab.io/discord-mcp check`)
  - Token and server validation
  - Full permission audit with visual progress bar
  - Color-coded pass/fail output
- Help and version commands
- Branded CLI output with QuadsLab.io ASCII art, ANSI colors, animated spinners
- TTY detection — auto-starts MCP server when launched via `.mcp.json`

### Changed

- Binary entry point changed from `mcp-server.js` to `cli.js`
- `mcp-server.ts` now exports `main()` for CLI imports

## [1.0.0] - 2026-02-22

### Added

- Initial release with 99 tools across 14 categories
- Guild tools (2): server info and metadata
- Role tools (9): CRUD, permissions, icons, assignment
- Channel tools (16): CRUD, permissions, locking, slowmode, cloning, forums, reordering
- Member tools (12): moderation, timeouts, pruning, bulk role operations, voice management
- Message tools (13): send, edit, delete, bulk delete, pins, reactions, crossposting
- Reaction tools (1): detailed reactor info with account age, join date, roles, boost status
- Server admin tools (13): settings, invites, bans, audit log, welcome screen, widget, integrations
- Thread tools (7): create, archive, lock, delete
- Forum tools (5): posts, tag management
- Emoji and sticker tools (7): upload, rename, delete
- Webhook tools (4): CRUD and message sending
- Scheduled event tools (4): create, edit, delete
- Stage instance tools (3): start, end, list
- Auto-moderation tools (4): rule CRUD
- Fuzzy name matching for all channel, role, and member parameters
- Pre-cached server data for instant lookups
- 3 MCP resources for server overview data
- Audit log reason support on all modifying operations
- Helpful error messages with name suggestions on failed lookups
