import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { EmbedBuilder, ColorResolvable } from 'discord.js';
import { getGuild } from '../discord-client.js';
import { smartFindMember } from './utils.js';

/**
 * Direct message tools - send DMs to server members
 */

export const dmTools: Tool[] = [
  {
    name: 'send_dm',
    description: 'Send a direct message to a server member. The member is resolved by name, ID, or mention using fuzzy matching.',
    inputSchema: {
      type: 'object',
      properties: {
        member: {
          type: 'string',
          description: 'The member name, ID, or mention (fuzzy matched)',
        },
        content: {
          type: 'string',
          description: 'The message content to send',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for sending (for audit/logging purposes)',
        },
      },
      required: ['member', 'content'],
    },
  },
  {
    name: 'send_dm_embed',
    description: 'Send a rich embed direct message to a server member. The member is resolved by name, ID, or mention using fuzzy matching.',
    inputSchema: {
      type: 'object',
      properties: {
        member: {
          type: 'string',
          description: 'The member name, ID, or mention (fuzzy matched)',
        },
        title: {
          type: 'string',
          description: 'The title of the embed',
        },
        description: {
          type: 'string',
          description: 'The description/main content of the embed',
        },
        color: {
          type: 'string',
          description: 'The color of the embed sidebar in hex format (e.g., "#FF0000")',
        },
        fields: {
          type: 'array',
          description: 'Array of fields to add to the embed',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Field title',
              },
              value: {
                type: 'string',
                description: 'Field content',
              },
              inline: {
                type: 'boolean',
                description: 'Whether to display inline with other fields',
              },
            },
            required: ['name', 'value'],
          },
        },
        footer: {
          type: 'string',
          description: 'Footer text for the embed',
        },
        thumbnail: {
          type: 'string',
          description: 'URL of thumbnail image (small image on the right)',
        },
        image: {
          type: 'string',
          description: 'URL of main image (large image at bottom)',
        },
      },
      required: ['member'],
    },
  },
];

export async function executeDmTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'send_dm':
      return await sendDm(args);
    case 'send_dm_embed':
      return await sendDmEmbed(args);
    default:
      throw new Error(`Unknown DM tool: ${name}`);
  }
}

async function sendDm(args: Record<string, unknown>): Promise<string> {
  const memberIdentifier = args['member'] as string;
  const content = args['content'] as string;
  const reason = args['reason'] as string | undefined;

  const member = await smartFindMember(memberIdentifier);

  try {
    const message = await member.send({ content });

    return JSON.stringify({
      success: true,
      message: `DM sent to ${member.user.username}`,
      ...(reason ? { reason } : {}),
      sentMessage: {
        id: message.id,
        content: message.content,
        recipient: {
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
        },
        createdAt: message.createdAt.toISOString(),
      },
    }, null, 2);
  } catch (error) {
    if ((error as any).code === 50007) {
      return JSON.stringify({
        success: false,
        message: `Cannot send DM to ${member.user.username}. They may have DMs disabled, or the bot does not share a server with them. The user needs to enable "Allow direct messages from server members" in their Privacy Settings.`,
        recipient: {
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
        },
      }, null, 2);
    }
    throw error;
  }
}

async function sendDmEmbed(args: Record<string, unknown>): Promise<string> {
  const memberIdentifier = args['member'] as string;

  const member = await smartFindMember(memberIdentifier);

  const embed = new EmbedBuilder();

  if (args['title']) embed.setTitle(args['title'] as string);
  if (args['description']) embed.setDescription(args['description'] as string);
  if (args['color']) embed.setColor(args['color'] as ColorResolvable);
  if (args['footer']) embed.setFooter({ text: args['footer'] as string });
  if (args['thumbnail']) embed.setThumbnail(args['thumbnail'] as string);
  if (args['image']) embed.setImage(args['image'] as string);
  embed.setTimestamp();

  // Add fields
  const fields = args['fields'] as Array<{ name: string; value: string; inline?: boolean }> | undefined;
  if (fields && Array.isArray(fields)) {
    for (const field of fields) {
      embed.addFields({
        name: field.name,
        value: field.value,
        inline: field.inline ?? false,
      });
    }
  }

  try {
    const message = await member.send({ embeds: [embed] });

    return JSON.stringify({
      success: true,
      message: `Embed DM sent to ${member.user.username}`,
      sentMessage: {
        id: message.id,
        recipient: {
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
        },
        createdAt: message.createdAt.toISOString(),
      },
    }, null, 2);
  } catch (error) {
    if ((error as any).code === 50007) {
      return JSON.stringify({
        success: false,
        message: `Cannot send DM to ${member.user.username}. They may have DMs disabled, or the bot does not share a server with them. The user needs to enable "Allow direct messages from server members" in their Privacy Settings.`,
        recipient: {
          id: member.id,
          username: member.user.username,
          displayName: member.displayName,
        },
      }, null, 2);
    }
    throw error;
  }
}
