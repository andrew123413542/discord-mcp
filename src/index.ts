import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import { allTools, executeTool } from './tools/index.js';
import { getServerSummary, getServerCache, getGuild, withRetry } from './discord-client.js';

// Read version from package.json
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

/**
 * Create and configure the MCP server for Discord management
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'discord-server',
      version: pkg.version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  // Handle list resources request
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'discord://server/summary',
          name: 'Discord Server Summary',
          description: 'Overview of the Discord server including all channels, roles, and member count. Use this to see available channels before sending messages.',
          mimeType: 'text/plain',
        },
        {
          uri: 'discord://server/channels',
          name: 'Channel List',
          description: 'List of all channels in the Discord server with their exact names',
          mimeType: 'application/json',
        },
        {
          uri: 'discord://server/roles',
          name: 'Role List',
          description: 'List of all roles in the Discord server',
          mimeType: 'application/json',
        },
      ],
    };
  });

  // Handle read resource request
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case 'discord://server/summary': {
        const summary = await getServerSummary();
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: summary,
            },
          ],
        };
      }
      case 'discord://server/channels': {
        const cache = await getServerCache();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(cache.channels, null, 2),
            },
          ],
        };
      }
      case 'discord://server/roles': {
        const cache = await getServerCache();
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(cache.roles, null, 2),
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  // Handle tool execution requests
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await withRetry(
        () => executeTool(name, (args as Record<string, unknown>) ?? {}),
        3,
        name,
      );

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const discordCode = error.code ?? error.httpStatus;
      const hints: string[] = [];

      // Enrich common Discord API errors with actionable hints
      if (discordCode === 50013 || errorMessage.includes('Missing Access') || errorMessage.includes('Missing Permissions')) {
        try {
          const guild = await getGuild();
          const botMember = guild.members.cache.get(guild.client.user!.id);
          const botRole = botMember?.roles.highest;
          if (botRole) {
            hints.push(`Bot's highest role is "${botRole.name}" (position ${botRole.position}). The bot can only manage roles and members below this position.`);
          }
          hints.push('Move the bot\'s role higher in Server Settings > Roles, or re-invite with the correct permissions.');
          hints.push('Run "npx @quadslab.io/discord-mcp check" to see which permissions are missing.');
        } catch {
          hints.push('Ensure the bot\'s role is high enough in the role hierarchy and has the required permissions.');
        }
      } else if (discordCode === 50001) {
        hints.push('The bot cannot access this resource. Check that it has View Channel permission and that the channel is not restricted.');
      } else if (discordCode === 50035) {
        hints.push('One or more arguments were invalid. Check the tool parameters and try again.');
      } else if (discordCode === 30005 || discordCode === 30007 || discordCode === 30010 || discordCode === 30013) {
        hints.push('A Discord server limit has been reached (max roles, channels, etc.).');
      }

      const response: Record<string, unknown> = {
        success: false,
        error: errorMessage,
      };
      if (hints.length > 0) {
        response['hints'] = hints;
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startMCPServer(server: Server): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr since stdout is used for MCP communication
  console.error(`Discord MCP server v${pkg.version} started`);
}
