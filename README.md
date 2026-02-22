# @quadslab.io/discord-mcp

[![npm version](https://img.shields.io/npm/v/@quadslab.io/discord-mcp)](https://www.npmjs.com/package/@quadslab.io/discord-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

**Manage your entire Discord server from Claude Code.** 99 admin tools across 14 categories — roles, channels, members, messages, moderation, forums, stages, webhooks, events, and more. Just talk to Claude in plain English.

Built by [QuadsLab.io](https://quadslab.io) with [Discord.js v14](https://discord.js.org/) and the [MCP SDK](https://github.com/modelcontextprotocol/sdk).

---

## Setup in 60 Seconds

One command. No manual config files. No copying IDs.

```bash
npx @quadslab.io/discord-mcp init
```

The interactive wizard walks you through everything:

```
    ____                  __     __          __
   / __ \__  ______ _____/ /____/ /   ____ _/ /_
  / / / / / / / __ `/ __  / ___/ /   / __ `/ __ \
 / /_/ / /_/ / /_/ / /_/ (__  ) /___/ /_/ / /_/ /
 \___\_\__,_/\__,_/\__,_/____/_____/\__,_/_.___/
                                          .io

  ┌────────────────────────────────────────────────────────┐
  │ Discord MCP Server  —  Interactive Setup               │
  │ 99 admin tools for managing Discord from Claude Code   │
  └────────────────────────────────────────────────────────┘

  ● ● ● ○ ○ ○  (3/6)
  Connecting to Discord

  ✔ Authenticated as MyBot#1234
    Application ID: 123456789
    Servers: 2 found
```

It will:
1. Guide you through creating a Discord bot (or use an existing one)
2. Validate your bot token live
3. Auto-generate the invite URL with all required permissions
4. Let you pick which server to manage
5. Write your `.mcp.json` automatically

Then open Claude Code and type `/mcp` to connect. Done.

### Verify Your Setup

```bash
npx @quadslab.io/discord-mcp check
```

```
  QuadsLab.io [discord-mcp] — Health Check
  ────────────────────────────────────────────────────

  Token ............ present
  Bot .............. MyBot#1234
  Server ........... My Gaming Server (1,024 members)

  Permissions
  ────────────────────────────────────────────────────

  ✔ Manage Roles .............. yes
  ✔ Manage Channels ........... yes
  ✔ Kick Members .............. yes
  ✔ Ban Members ............... yes
  ...

  ██████████████████████████████  100% (24/24)

  ✔ All 24 permissions granted

  ┌──────────────────────────────────────────────────┐
  │ MCP server is ready!                             │
  │ Run discord-mcp or use via .mcp.json in Claude   │
  └──────────────────────────────────────────────────┘
```

---

## What Can You Do With It?

Once connected to Claude Code, just ask in natural language:

- *"Send a welcome message in #general"*
- *"Lock down the #announcements channel"*
- *"Who reacted to the last message in #server-guide?"*
- *"Create a role called VIP with a gold color and assign it to @john"*
- *"Show me the audit log for the last 24 hours"*
- *"Set up an automod rule to block links in #general"*
- *"Create a forum post in #feedback titled Bug Reports"*
- *"Timeout @spammer for 1 hour for spamming"*
- *"List all webhooks and delete the unused ones"*
- *"Schedule a community event for Friday at 8pm in the Stage channel"*
- *"Bulk delete the last 50 messages in #bot-testing"*
- *"Give everyone with the Member role access to #private-channel"*

Claude automatically resolves channel, role, and member names using fuzzy matching — no need to look up IDs.

---

## Features

- **99 tools across 14 categories** — comprehensive Discord server administration without leaving the terminal
- **Interactive setup wizard** — `npx init` walks you through bot creation, token validation, and config in under a minute
- **Health check & permission audit** — `npx check` verifies your token, server access, and all 24 required permissions with a visual progress bar
- **Fuzzy name resolution** — type `"bot testing"`, `"bot-testing"`, or `"bottesting"` and it resolves correctly; no need to look up IDs
- **Zero-config name matching** — channels, roles, and members are all resolved by name, ID, or mention format automatically
- **Pre-cached server data** — all channels, roles, and members are cached on startup for instant lookups without extra API calls
- **Structured JSON responses** — every tool returns consistent, pretty-printed JSON
- **Audit log integration** — all modifying operations accept a `reason` parameter that appears in the Discord audit log
- **Helpful error recovery** — failed lookups return suggestions (e.g., "Did you mean: #general, #bot-testing?")
- **MCP resources** — three read-only resources for server overview data

---

## Alternative Setup (Manual)

If you prefer to configure things manually instead of using the wizard:

<details>
<summary><strong>Manual setup steps</strong></summary>

### 1. Create a Discord bot

Follow the [Bot Setup Guide](docs/bot-setup-guide.md) to create a bot in the Discord Developer Portal and get your token.

### 2. Add to `.mcp.json`

Create or edit `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "discord": {
      "command": "npx",
      "args": ["-y", "@quadslab.io/discord-mcp"],
      "env": {
        "DISCORD_TOKEN": "your-bot-token",
        "DISCORD_GUILD_ID": "your-server-id"
      }
    }
  }
}
```

### 3. Connect in Claude Code

Type `/mcp` in Claude Code to connect the server.

</details>

<details>
<summary><strong>Run from source</strong></summary>

```bash
git clone https://github.com/HardHeadHackerHead/discord-mcp.git
cd discord-mcp
npm install
cp .env.example .env
# Edit .env with your DISCORD_TOKEN and DISCORD_GUILD_ID
npm run build
npm start
```

</details>

---

## CLI Reference

```
$ npx @quadslab.io/discord-mcp [command]
```

| Command | Description |
|---------|-------------|
| `init` | Interactive setup wizard — creates bot, validates token, writes `.mcp.json` |
| `check` | Health check — verifies token, server access, and permission audit |
| `start` | Start the MCP server (default when no command given) |
| `help` | Show help message |
| `version` | Show version |

When launched via `.mcp.json` (stdin is not a TTY), the server starts automatically — no subcommand needed.

---

## Tools Overview

### Summary

| Category | Tools | Description |
|----------|------:|-------------|
| Guild | 2 | Server information and metadata |
| Roles | 9 | Role creation, editing, permissions, and assignment |
| Channels | 16 | Channel creation, editing, permissions, and organization |
| Members | 12 | Member management, moderation, and bulk operations |
| Messages | 13 | Send, edit, delete, pin, and react to messages |
| Reactions | 1 | Detailed reaction data with reactor info |
| Server Admin | 13 | Server settings, invites, bans, audit log, and integrations |
| Threads | 7 | Thread creation, archiving, locking, and deletion |
| Forums | 5 | Forum posts and tag management |
| Emojis & Stickers | 7 | Custom emoji and sticker management |
| Webhooks | 4 | Webhook creation, deletion, and messaging |
| Scheduled Events | 4 | Event creation, editing, and deletion |
| Stage Instances | 3 | Stage channel management |
| Auto-Moderation | 4 | Automod rule creation, editing, and deletion |
| **Total** | **99** | |

---

<details>
<summary><strong>Full tool reference (click to expand)</strong></summary>

### Guild (2 tools)

| Tool | Description |
|------|-------------|
| `list_guilds` | List all servers the bot is a member of |
| `get_guild_info` | Detailed server info — member count, channels, roles, features, boost tier |

### Roles (9 tools)

| Tool | Description |
|------|-------------|
| `list_roles` | List all roles sorted by position with colors and member counts |
| `create_role` | Create a new role with name, color, hoist, and mentionable options |
| `delete_role` | Delete a role (with managed role protection) |
| `modify_role` | Change a role's name, color, hoist, mentionable, or position |
| `get_role_permissions` | View all permissions granted to a role |
| `modify_role_permissions` | Grant or revoke specific permissions on a role |
| `set_role_icon` | Set a Unicode emoji or image as the role icon (requires boost level 2+) |
| `assign_role` | Add a role to a member |
| `remove_role` | Remove a role from a member |

### Channels (16 tools)

| Tool | Description |
|------|-------------|
| `list_channels` | List all channels organized by category |
| `create_text_channel` | Create a new text channel, optionally in a category |
| `create_voice_channel` | Create a new voice channel with bitrate and user limit |
| `create_category` | Create a new channel category |
| `create_forum_channel` | Create a new forum channel with optional tags and default settings |
| `delete_channel` | Delete any channel type |
| `modify_channel` | Change name, topic, category, NSFW, position, user limit |
| `set_channel_permissions` | Set permission overwrites for a role or user on a channel |
| `view_channel_permissions` | View all permission overwrites on a channel |
| `lock_channel` | Deny SendMessages for @everyone (quick lock) |
| `unlock_channel` | Remove SendMessages deny for @everyone |
| `set_slowmode` | Set rate limit (0–21600 seconds) on a text channel |
| `clone_channel` | Duplicate a channel with all permissions and settings |
| `reorder_channels` | Reorder channels by specifying new positions |
| `set_voice_region` | Set the RTC region for a voice channel |
| `follow_announcement_channel` | Follow an announcement channel to cross-post into another channel |

### Members (12 tools)

| Tool | Description |
|------|-------------|
| `list_members` | List members with optional role and search filters |
| `get_member` | Detailed member info — roles, join date, account age, permissions |
| `kick_member` | Kick a member from the server |
| `ban_member` | Ban a member with optional message deletion (0–7 days) |
| `unban_member` | Remove a ban by username or user ID |
| `timeout_member` | Apply a timeout (10m, 1h, 1d, 1w) or remove one |
| `prune_members` | Remove inactive members (supports dry run and role filtering) |
| `bulk_assign_role` | Assign a role to multiple members at once |
| `bulk_remove_role` | Remove a role from multiple members at once |
| `set_nickname` | Change a member's nickname or reset it |
| `move_to_voice` | Move a member to a different voice channel |
| `disconnect_from_voice` | Disconnect a member from their voice channel |

### Messages (13 tools)

| Tool | Description |
|------|-------------|
| `get_messages` | Fetch recent messages from a text or voice channel |
| `get_message` | Fetch a single message by ID with full details |
| `send_message` | Send a text message, optionally as a reply |
| `send_embed` | Send a rich embed with title, fields, images, and footer |
| `edit_message` | Edit a message previously sent by the bot |
| `delete_message` | Delete a single message by ID |
| `bulk_delete_messages` | Delete 2–100 messages at once (< 14 days old), optionally filtered by user |
| `crosspost_message` | Publish a message in an announcement channel to all following channels |
| `pin_message` | Pin a message |
| `unpin_message` | Unpin a message |
| `list_pinned_messages` | Get all pinned messages in a channel |
| `add_reaction` | Add a reaction from the bot to a message |
| `remove_reaction` | Remove the bot's reaction from a message |

### Reactions (1 tool)

| Tool | Description |
|------|-------------|
| `get_reactions` | Get all reactions on a message with full reactor details — account creation date, server join date, roles, avatar, boost status. Optionally filter by emoji. |

### Server Admin (13 tools)

| Tool | Description |
|------|-------------|
| `edit_server` | Modify server name, description, verification level, notification defaults |
| `list_invites` | List all active invite links with usage stats and expiration |
| `create_invite` | Generate a new invite with configurable max age, uses, and temporary flag |
| `delete_invite` | Revoke an invite by code |
| `get_audit_log` | Fetch audit log entries, optionally filtered by action type or user |
| `list_bans` | View all banned users with reasons |
| `get_welcome_screen` | Get the server welcome screen configuration |
| `set_welcome_screen` | Configure the welcome screen with description and featured channels |
| `get_widget` | Get the server widget settings |
| `set_widget` | Configure the server widget (enable/disable, set channel) |
| `get_vanity_url` | Get the server vanity URL (requires VANITY_URL feature) |
| `list_integrations` | List all integrations (bots, apps) connected to the server |
| `delete_integration` | Remove an integration from the server |

### Threads (7 tools)

| Tool | Description |
|------|-------------|
| `list_threads` | List active threads, optionally filtered to a channel |
| `create_thread` | Start a thread from a message or as a standalone public thread |
| `archive_thread` | Archive a thread |
| `unarchive_thread` | Unarchive a thread |
| `delete_thread` | Delete a thread |
| `lock_thread` | Lock a thread (prevent new messages without archiving) |
| `unlock_thread` | Unlock a thread |

### Forums (5 tools)

| Tool | Description |
|------|-------------|
| `create_forum_post` | Create a new post (thread) in a forum channel with optional tags |
| `list_forum_tags` | List all available tags on a forum channel |
| `create_forum_tag` | Add a new tag to a forum channel (max 20 per channel) |
| `edit_forum_tag` | Edit an existing forum tag's name, emoji, or moderated status |
| `delete_forum_tag` | Remove a tag from a forum channel |

### Emojis & Stickers (7 tools)

| Tool | Description |
|------|-------------|
| `list_emojis` | List all custom emojis with names, IDs, animated status, and URLs |
| `create_emoji` | Upload a new custom emoji from a URL |
| `delete_emoji` | Remove a custom emoji by name or ID |
| `rename_emoji` | Rename a custom emoji |
| `list_stickers` | List all custom stickers with descriptions and format info |
| `create_sticker` | Upload a new custom sticker from a URL |
| `delete_sticker` | Remove a custom sticker by name or ID |

### Webhooks (4 tools)

| Tool | Description |
|------|-------------|
| `list_webhooks` | List all webhooks, optionally filtered to a channel |
| `create_webhook` | Create a webhook on a channel with name and optional avatar |
| `delete_webhook` | Delete a webhook by ID |
| `send_webhook_message` | Send a message via webhook with optional name/avatar override |

### Scheduled Events (4 tools)

| Tool | Description |
|------|-------------|
| `list_events` | List all scheduled events with times, status, type, and attendee count |
| `create_event` | Create a voice, stage, or external event with start/end times |
| `edit_event` | Modify an event's name, description, times, or status |
| `delete_event` | Delete a scheduled event |

### Stage Instances (3 tools)

| Tool | Description |
|------|-------------|
| `list_stage_instances` | List all active stage instances with topic and channel info |
| `start_stage` | Start a new stage instance on a stage channel with a topic |
| `end_stage` | End an active stage instance |

### Auto-Moderation (4 tools)

| Tool | Description |
|------|-------------|
| `list_automod_rules` | List all automod rules with triggers, actions, and exemptions |
| `create_automod_rule` | Create a rule — keyword filter, spam detection, keyword presets, or mention spam |
| `edit_automod_rule` | Modify a rule's keywords, actions, exemptions, or enabled state |
| `delete_automod_rule` | Delete an automod rule |

</details>

---

## Fuzzy Matching

All tools that accept channel, role, or member names use smart fuzzy matching. You never need to look up IDs manually. The resolution order is:

1. **Exact ID match** — pass a Discord snowflake ID directly
2. **Exact name match** — case-insensitive
3. **Normalized match** — ignores hyphens, spaces, and underscores (`"bot testing"` matches `"bot-testing"`)
4. **Substring match** — partial name matches at 0.7+ similarity threshold

Mention formats are also handled automatically:

- Channels: `#name` or `<#id>`
- Roles: `@name` or `<@&id>`
- Members: `@name` or `<@id>` or `<@!id>`

If no match is found, the error message includes suggestions of similar names to help you correct the input.

---

## MCP Resources

Three read-only resources are exposed for quick server overview data:

| URI | Description |
|-----|-------------|
| `discord://server/summary` | Text overview of the server (channels, roles, members) |
| `discord://server/channels` | JSON list of all channels organized by category |
| `discord://server/roles` | JSON list of all roles sorted by position |

---

## Required Permissions

The Discord bot needs the following permissions for full functionality:

| Category | Permissions |
|----------|-------------|
| **General** | Manage Server, Manage Roles, Manage Channels, View Audit Log, Manage Webhooks, Manage Events, Manage Emojis and Stickers |
| **Text** | Send Messages, Manage Messages, Read Message History, Add Reactions, Use External Emojis |
| **Voice** | Move Members, Disconnect Members |
| **Moderation** | Kick Members, Ban Members, Moderate Members, Manage Auto Moderation |

The `init` wizard auto-generates an invite URL with all of these. If you set up manually, see the [Bot Setup Guide](docs/bot-setup-guide.md) for which checkboxes to select.

The bot can only act within its role hierarchy — it cannot manage roles positioned higher than its own highest role.

### Gateway Intents

These privileged intents must be enabled in the [Discord Developer Portal](https://discord.com/developers/applications):

- **Server Members Intent** — required for member management
- **Message Content Intent** — required for reading message content

---

## Architecture

```
@quadslab.io/discord-mcp/
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── .env.example
├── docs/
│   ├── discord-mcp-server.md    # Full tool reference documentation
│   └── bot-setup-guide.md       # Step-by-step bot creation guide
└── src/
    ├── cli.ts                   # CLI — init wizard, health check, server start
    ├── mcp-server.ts            # MCP server — validates env, initializes client
    ├── index.ts                 # Tool/resource registration and request routing
    ├── discord-client.ts        # Discord.js client — intents, caching, connection
    └── tools/
        ├── index.ts             # Tool registry — routes calls to category handlers
        ├── utils.ts             # Fuzzy matching for channels, roles, members
        ├── guild.ts             # Server info (2)
        ├── roles.ts             # Role management (9)
        ├── channels.ts          # Channel management (16)
        ├── members.ts           # Member management (12)
        ├── messages.ts          # Messaging (13)
        ├── reactions.ts         # Reactions (1)
        ├── server.ts            # Server admin (13)
        ├── threads.ts           # Thread management (7)
        ├── forums.ts            # Forum channels (5)
        ├── emojis.ts            # Emoji & stickers (7)
        ├── webhooks.ts          # Webhooks (4)
        ├── events.ts            # Scheduled events (4)
        ├── stage.ts             # Stage instances (3)
        └── automod.ts           # Auto-moderation (4)
```

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style, and guidelines.

---

## License

MIT License. Copyright (c) 2026 [QuadsLab.io](https://quadslab.io).

See [LICENSE](LICENSE) for the full text.
