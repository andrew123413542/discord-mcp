import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild } from '../discord-client.js';

/**
 * Server template management tools
 */

export const templateTools: Tool[] = [
  {
    name: 'list_templates',
    description: 'List all server templates for the Discord server. Returns template details including code, name, description, usage count, and creator.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_template',
    description: 'Create a new server template from the current Discord server state.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the template',
        },
        description: {
          type: 'string',
          description: 'A description for the template',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'delete_template',
    description: 'Delete a server template from the Discord server.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The template code to delete',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'sync_template',
    description: 'Sync a server template with the current state of the Discord server.',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The template code to sync',
        },
      },
      required: ['code'],
    },
  },
];

export async function executeTemplateTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'list_templates':
      return await listTemplates();
    case 'create_template':
      return await createTemplate(args);
    case 'delete_template':
      return await deleteTemplate(args);
    case 'sync_template':
      return await syncTemplate(args);
    default:
      throw new Error(`Unknown template tool: ${name}`);
  }
}

async function listTemplates(): Promise<string> {
  const guild = await getGuild();
  const templates = await guild.fetchTemplates();

  const result = templates.map(template => ({
    code: template.code,
    name: template.name,
    description: template.description,
    usageCount: template.usageCount,
    creatorId: template.creatorId,
    createdAt: template.createdAt?.toISOString() ?? null,
    updatedAt: template.updatedAt?.toISOString() ?? null,
    sourceGuildId: template.guildId,
  }));

  return JSON.stringify({
    success: true,
    totalTemplates: result.length,
    templates: result,
  }, null, 2);
}

async function createTemplate(args: Record<string, unknown>): Promise<string> {
  const guild = await getGuild();

  const name = args['name'] as string;
  const description = (args['description'] as string | undefined) ?? '';

  const template = await guild.createTemplate(name, description);

  return JSON.stringify({
    success: true,
    message: `Template "${template.name}" created successfully`,
    template: {
      code: template.code,
      name: template.name,
      description: template.description,
      usageCount: template.usageCount,
      creatorId: template.creatorId,
      createdAt: template.createdAt?.toISOString() ?? null,
      updatedAt: template.updatedAt?.toISOString() ?? null,
      sourceGuildId: template.guildId,
    },
  }, null, 2);
}

async function deleteTemplate(args: Record<string, unknown>): Promise<string> {
  const guild = await getGuild();

  const code = args['code'] as string;
  const templates = await guild.fetchTemplates();
  const template = templates.find(t => t.code === code);

  if (!template) {
    throw new Error(`Template with code "${code}" not found.`);
  }

  const templateName = template.name;
  await template.delete();

  return JSON.stringify({
    success: true,
    message: `Template "${templateName}" deleted successfully`,
  }, null, 2);
}

async function syncTemplate(args: Record<string, unknown>): Promise<string> {
  const guild = await getGuild();

  const code = args['code'] as string;
  const templates = await guild.fetchTemplates();
  const template = templates.find(t => t.code === code);

  if (!template) {
    throw new Error(`Template with code "${code}" not found.`);
  }

  const synced = await template.sync();

  return JSON.stringify({
    success: true,
    message: `Template "${synced.name}" synced successfully`,
    template: {
      code: synced.code,
      name: synced.name,
      description: synced.description,
      usageCount: synced.usageCount,
      creatorId: synced.creatorId,
      createdAt: synced.createdAt?.toISOString() ?? null,
      updatedAt: synced.updatedAt?.toISOString() ?? null,
      sourceGuildId: synced.guildId,
    },
  }, null, 2);
}
