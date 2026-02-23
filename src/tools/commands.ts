import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild, getClient } from '../discord-client.js';
import { ApplicationCommandOptionType } from 'discord.js';

/**
 * Application slash command management tools
 */

export const commandTools: Tool[] = [
  {
    name: 'list_commands',
    description: 'List all registered application (slash) commands. Returns command details including name, description, type, and options count.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['guild', 'global'],
          description: 'Whether to list guild-specific or global commands. Defaults to "guild".',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_command',
    description: 'Create a new application (slash) command. Command names must be lowercase, contain no spaces, and be 1-32 characters.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The command name (lowercase, no spaces, 1-32 characters)',
        },
        description: {
          type: 'string',
          description: 'A description for the command (1-100 characters)',
        },
        scope: {
          type: 'string',
          enum: ['guild', 'global'],
          description: 'Whether to create a guild-specific or global command. Defaults to "guild".',
        },
        options: {
          type: 'array',
          description: 'Array of command options/parameters',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'The option name',
              },
              description: {
                type: 'string',
                description: 'A description for the option',
              },
              type: {
                type: 'string',
                enum: ['String', 'Integer', 'Boolean', 'User', 'Channel', 'Role', 'Number'],
                description: 'The option type',
              },
              required: {
                type: 'boolean',
                description: 'Whether this option is required',
              },
            },
            required: ['name', 'description', 'type'],
          },
        },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'edit_command',
    description: 'Edit an existing application (slash) command. You can update its name and/or description.',
    inputSchema: {
      type: 'object',
      properties: {
        commandId: {
          type: 'string',
          description: 'The ID of the command to edit',
        },
        name: {
          type: 'string',
          description: 'New name for the command (lowercase, no spaces, 1-32 characters)',
        },
        description: {
          type: 'string',
          description: 'New description for the command (1-100 characters)',
        },
        scope: {
          type: 'string',
          enum: ['guild', 'global'],
          description: 'Whether the command is guild-specific or global. Defaults to "guild".',
        },
      },
      required: ['commandId'],
    },
  },
  {
    name: 'delete_command',
    description: 'Delete an application (slash) command.',
    inputSchema: {
      type: 'object',
      properties: {
        commandId: {
          type: 'string',
          description: 'The ID of the command to delete',
        },
        scope: {
          type: 'string',
          enum: ['guild', 'global'],
          description: 'Whether the command is guild-specific or global. Defaults to "guild".',
        },
      },
      required: ['commandId'],
    },
  },
];

export async function executeCommandTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'list_commands':
      return await listCommands(args);
    case 'create_command':
      return await createCommand(args);
    case 'edit_command':
      return await editCommand(args);
    case 'delete_command':
      return await deleteCommand(args);
    default:
      throw new Error(`Unknown command tool: ${name}`);
  }
}

function mapOptionTypeString(type: string): ApplicationCommandOptionType {
  switch (type) {
    case 'String':
      return ApplicationCommandOptionType.String;
    case 'Integer':
      return ApplicationCommandOptionType.Integer;
    case 'Boolean':
      return ApplicationCommandOptionType.Boolean;
    case 'User':
      return ApplicationCommandOptionType.User;
    case 'Channel':
      return ApplicationCommandOptionType.Channel;
    case 'Role':
      return ApplicationCommandOptionType.Role;
    case 'Number':
      return ApplicationCommandOptionType.Number;
    default:
      throw new Error(`Invalid option type: "${type}". Must be "String", "Integer", "Boolean", "User", "Channel", "Role", or "Number".`);
  }
}

function mapOptionTypeToString(type: ApplicationCommandOptionType): string {
  switch (type) {
    case ApplicationCommandOptionType.String:
      return 'String';
    case ApplicationCommandOptionType.Integer:
      return 'Integer';
    case ApplicationCommandOptionType.Boolean:
      return 'Boolean';
    case ApplicationCommandOptionType.User:
      return 'User';
    case ApplicationCommandOptionType.Channel:
      return 'Channel';
    case ApplicationCommandOptionType.Role:
      return 'Role';
    case ApplicationCommandOptionType.Number:
      return 'Number';
    default:
      return 'Unknown';
  }
}

async function listCommands(args: Record<string, unknown>): Promise<string> {
  const scope = (args['scope'] as string) || 'guild';

  let commands;
  if (scope === 'global') {
    const client = getClient();
    commands = await client.application!.commands.fetch();
  } else {
    const guild = await getGuild();
    commands = await guild.commands.fetch();
  }

  const result = commands.map(cmd => ({
    id: cmd.id,
    name: cmd.name,
    description: cmd.description,
    type: cmd.type,
    optionsCount: cmd.options?.length ?? 0,
  }));

  return JSON.stringify({
    success: true,
    scope,
    totalCommands: result.length,
    commands: result,
  }, null, 2);
}

async function createCommand(args: Record<string, unknown>): Promise<string> {
  const scope = (args['scope'] as string) || 'guild';
  const name = args['name'] as string;
  const description = args['description'] as string;
  const options = args['options'] as Array<{ name: string; description: string; type: string; required?: boolean }> | undefined;

  // Validate name
  if (!name || name.length < 1 || name.length > 32) {
    throw new Error('Command name must be between 1 and 32 characters.');
  }
  if (name !== name.toLowerCase() || name.includes(' ')) {
    throw new Error('Command name must be lowercase and contain no spaces.');
  }

  // Validate description
  if (!description || description.length < 1 || description.length > 100) {
    throw new Error('Command description must be between 1 and 100 characters.');
  }

  const commandData: Record<string, unknown> = {
    name,
    description,
  };

  if (options && options.length > 0) {
    commandData['options'] = options.map(opt => ({
      name: opt.name,
      description: opt.description,
      type: mapOptionTypeString(opt.type),
      required: opt.required ?? false,
    }));
  }

  let command;
  if (scope === 'global') {
    const client = getClient();
    command = await client.application!.commands.create(commandData as any);
  } else {
    const guild = await getGuild();
    command = await guild.commands.create(commandData as any);
  }

  return JSON.stringify({
    success: true,
    message: `Command "/${command.name}" created successfully (${scope})`,
    command: {
      id: command.id,
      name: command.name,
      description: command.description,
      type: command.type,
      optionsCount: command.options?.length ?? 0,
    },
  }, null, 2);
}

async function editCommand(args: Record<string, unknown>): Promise<string> {
  const scope = (args['scope'] as string) || 'guild';
  const commandId = args['commandId'] as string;

  const updates: Record<string, unknown> = {};

  if (args['name'] !== undefined) {
    const name = args['name'] as string;
    if (name.length < 1 || name.length > 32) {
      throw new Error('Command name must be between 1 and 32 characters.');
    }
    if (name !== name.toLowerCase() || name.includes(' ')) {
      throw new Error('Command name must be lowercase and contain no spaces.');
    }
    updates['name'] = name;
  }

  if (args['description'] !== undefined) {
    const description = args['description'] as string;
    if (description.length < 1 || description.length > 100) {
      throw new Error('Command description must be between 1 and 100 characters.');
    }
    updates['description'] = description;
  }

  let command;
  if (scope === 'global') {
    const client = getClient();
    command = await client.application!.commands.edit(commandId, updates as any);
  } else {
    const guild = await getGuild();
    command = await guild.commands.edit(commandId, updates as any);
  }

  return JSON.stringify({
    success: true,
    message: `Command "/${command.name}" updated successfully (${scope})`,
    command: {
      id: command.id,
      name: command.name,
      description: command.description,
      type: command.type,
      optionsCount: command.options?.length ?? 0,
    },
  }, null, 2);
}

async function deleteCommand(args: Record<string, unknown>): Promise<string> {
  const scope = (args['scope'] as string) || 'guild';
  const commandId = args['commandId'] as string;

  if (scope === 'global') {
    const client = getClient();
    await client.application!.commands.delete(commandId);
  } else {
    const guild = await getGuild();
    await guild.commands.delete(commandId);
  }

  return JSON.stringify({
    success: true,
    message: `Command with ID "${commandId}" deleted successfully (${scope})`,
  }, null, 2);
}
