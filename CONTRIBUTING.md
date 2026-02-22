# Contributing to @quadslab.io/discord-mcp

Thank you for your interest in contributing to discord-mcp. This guide covers everything you need to get started.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Adding New Tools](#adding-new-tools)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/discord-mcp.git
   cd discord-mcp
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes, commit, and push to your fork.
5. Open a **Pull Request** against the `main` branch.

---

## Development Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode (live TypeScript execution)
npm run dev
```

You will need a `.env` file with your Discord bot token and guild ID. See `.env.example` for the required variables.

---

## Adding New Tools

Every tool follows a consistent pattern across the codebase. To add a new tool:

### 1. Define the tool in a category file

Open the appropriate category file in `src/tools/` (e.g., `channels.ts`, `roles.ts`). Add a new tool definition to the category's tools array:

```typescript
{
  name: 'your_tool_name',
  description: 'Clear, concise description of what the tool does',
  inputSchema: {
    type: 'object',
    properties: {
      channel: { type: 'string', description: 'Channel name, ID, or mention' },
      reason: { type: 'string', description: 'Reason for audit log' },
    },
    required: ['channel'],
  },
}
```

### 2. Add a router case

In the same category file, add a case to the `execute*Tool` function's switch statement:

```typescript
case 'your_tool_name':
  return await yourToolFunction(args);
```

### 3. Implement the function

Write the implementation function in the same file. Follow the existing patterns -- resolve names with fuzzy matching utilities, perform the Discord API operation, and return structured JSON.

### 4. Register in tools/index.ts

If you are creating an entirely new category (not adding to an existing one), import your tools and executor in `src/tools/index.ts`, add the tools to the `allTools` array, map them in `toolCategories`, and add a case to the `executeTool` switch statement.

---

## Code Style

- **TypeScript strict mode** -- the project uses strict TypeScript compilation. All code must pass `tsc` with no errors.
- **JSON responses** -- every tool must return a structured JSON string via `JSON.stringify(result, null, 2)`. Do not return plain text.
- **Fuzzy matching for name parameters** -- any parameter that accepts a channel, role, or member name must use the shared fuzzy resolution utilities in `src/tools/utils.ts`. Never require raw Discord IDs from the user.
- **`reason` parameter for audit log** -- all tools that modify server state should accept an optional `reason` string parameter. Pass this to the Discord API so the action is recorded in the server audit log.
- **Consistent naming** -- tool names use `snake_case`. Categories group related functionality.
- **No external dependencies** without discussion -- the project intentionally keeps a minimal dependency footprint (discord.js, MCP SDK, dotenv).

---

## Testing

- **The build must pass.** Run `npm run build` before submitting. TypeScript compilation errors will block your PR.
- **Test against a real Discord server.** There is no automated test suite at this time. Create a test Discord server, connect the bot, and verify your changes work end-to-end through Claude Code or by running the MCP server directly.
- **Test fuzzy matching.** If your tool accepts name parameters, verify that exact names, partial names, normalized names (with/without hyphens and spaces), and IDs all resolve correctly.
- **Test error cases.** Verify that invalid inputs return helpful error messages with suggestions where appropriate.

---

## Documentation

When adding or modifying tools, update the following:

1. **`docs/discord-mcp-server.md`** -- add or update the tool entry in the appropriate category section.
2. **`README.md`** -- update the tool count in the summary table and add the tool to the appropriate category table.
3. If you add a new category, add a new section in both files and update the total tool count.

---

## Submitting Changes

1. Ensure your branch is up to date with `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Confirm the build passes:
   ```bash
   npm run build
   ```
3. Write a clear commit message describing what you changed and why.
4. Push your branch and open a Pull Request.
5. Fill out the PR template completely.
6. Wait for review. Address any feedback promptly.

---

## Reporting Issues

When reporting a bug, please include:

- A clear description of the problem.
- Steps to reproduce the issue.
- Expected behavior vs. actual behavior.
- Your environment: Node.js version, discord.js version, operating system.
- Any relevant error messages or logs.

For feature requests, describe the use case and proposed solution. Check existing issues first to avoid duplicates.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
