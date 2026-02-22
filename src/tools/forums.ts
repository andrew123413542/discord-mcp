import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild } from '../discord-client.js';
import { smartFindChannel } from './utils.js';
import { ChannelType, ForumChannel, SortOrderType, ThreadAutoArchiveDuration } from 'discord.js';

/**
 * Forum channel management tools
 */

export const forumTools: Tool[] = [
  {
    name: 'create_forum_post',
    description: 'Create a new post (thread) in a forum channel. Channel name is fuzzy-matched.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The forum channel name or ID (fuzzy matched)',
        },
        name: {
          type: 'string',
          description: 'The title of the forum post',
        },
        content: {
          type: 'string',
          description: 'The content of the initial message in the post',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tag names to apply to the post (optional)',
        },
      },
      required: ['channel', 'name', 'content'],
    },
  },
  {
    name: 'list_forum_tags',
    description: 'List all available tags on a forum channel. Channel name is fuzzy-matched.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The forum channel name or ID (fuzzy matched)',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'create_forum_tag',
    description: 'Add a new tag to a forum channel. Discord allows a maximum of 20 tags per forum channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The forum channel name or ID (fuzzy matched)',
        },
        name: {
          type: 'string',
          description: 'The name for the new tag',
        },
        emoji: {
          type: 'string',
          description: 'A unicode emoji for the tag (optional)',
        },
        moderated: {
          type: 'boolean',
          description: 'Whether only moderators can apply this tag (optional, default: false)',
        },
      },
      required: ['channel', 'name'],
    },
  },
  {
    name: 'edit_forum_tag',
    description: 'Edit an existing tag on a forum channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The forum channel name or ID (fuzzy matched)',
        },
        tagId: {
          type: 'string',
          description: 'The ID of the tag to edit',
        },
        name: {
          type: 'string',
          description: 'The new name for the tag (optional)',
        },
        emoji: {
          type: 'string',
          description: 'A new unicode emoji for the tag (optional)',
        },
        moderated: {
          type: 'boolean',
          description: 'Whether only moderators can apply this tag (optional)',
        },
      },
      required: ['channel', 'tagId'],
    },
  },
  {
    name: 'delete_forum_tag',
    description: 'Remove a tag from a forum channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The forum channel name or ID (fuzzy matched)',
        },
        tagId: {
          type: 'string',
          description: 'The ID of the tag to remove',
        },
      },
      required: ['channel', 'tagId'],
    },
  },
];

export async function executeForumTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'create_forum_post':
      return await createForumPost(args);
    case 'list_forum_tags':
      return await listForumTags(args);
    case 'create_forum_tag':
      return await createForumTag(args);
    case 'edit_forum_tag':
      return await editForumTag(args);
    case 'delete_forum_tag':
      return await deleteForumTag(args);
    default:
      throw new Error(`Unknown forum tool: ${name}`);
  }
}

/**
 * Resolve a channel identifier to a ForumChannel, throwing if it's not a forum.
 */
async function resolveForumChannel(identifier: string): Promise<ForumChannel> {
  const channel = await smartFindChannel(identifier);

  if (channel.type !== ChannelType.GuildForum) {
    throw new Error(`Channel "#${channel.name}" is not a forum channel.`);
  }

  return channel as ForumChannel;
}

async function createForumPost(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const name = args['name'] as string;
  const content = args['content'] as string;
  const tagNames = args['tags'] as string[] | undefined;

  const channel = await resolveForumChannel(channelIdentifier);

  // Resolve tag names to IDs if provided
  let appliedTags: string[] | undefined;
  if (tagNames && tagNames.length > 0) {
    const availableTags = channel.availableTags;
    appliedTags = [];

    for (const tagName of tagNames) {
      const tagNameLower = tagName.toLowerCase();
      const matchedTag = availableTags.find(
        t => t.name.toLowerCase() === tagNameLower
      );

      if (matchedTag) {
        appliedTags.push(matchedTag.id);
      } else {
        throw new Error(
          `Tag "${tagName}" not found on forum "#${channel.name}". Available tags: ${availableTags.map(t => t.name).join(', ') || 'none'}`
        );
      }
    }
  }

  const thread = await channel.threads.create({
    name,
    message: { content },
    appliedTags,
  });

  return JSON.stringify({
    success: true,
    message: `Forum post "${thread.name}" created successfully in #${channel.name}`,
    thread: {
      id: thread.id,
      name: thread.name,
      url: thread.url,
    },
  }, null, 2);
}

async function listForumTags(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const channel = await resolveForumChannel(channelIdentifier);

  const tags = channel.availableTags.map(tag => ({
    id: tag.id,
    name: tag.name,
    emoji: tag.emoji,
    moderated: tag.moderated,
  }));

  return JSON.stringify({
    channel: { name: channel.name, id: channel.id },
    tagCount: tags.length,
    tags,
  }, null, 2);
}

async function createForumTag(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const name = args['name'] as string;
  const emoji = args['emoji'] as string | undefined;
  const moderated = args['moderated'] as boolean | undefined;

  const channel = await resolveForumChannel(channelIdentifier);
  const existingTags = channel.availableTags;

  if (existingTags.length >= 20) {
    throw new Error(
      `Forum "#${channel.name}" already has the maximum of 20 tags. Remove a tag before adding a new one.`
    );
  }

  const updatedTags = [
    ...existingTags,
    {
      name,
      emoji: emoji ? { name: emoji } : undefined,
      moderated: moderated ?? false,
    },
  ];

  await channel.setAvailableTags(updatedTags as any);

  return JSON.stringify({
    success: true,
    message: `Tag "${name}" added to forum "#${channel.name}"`,
    tagCount: updatedTags.length,
  }, null, 2);
}

async function editForumTag(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const tagId = args['tagId'] as string;
  const name = args['name'] as string | undefined;
  const emoji = args['emoji'] as string | undefined;
  const moderated = args['moderated'] as boolean | undefined;

  const channel = await resolveForumChannel(channelIdentifier);
  const existingTags = channel.availableTags;

  const tagIndex = existingTags.findIndex(t => t.id === tagId);
  if (tagIndex === -1) {
    throw new Error(
      `Tag with ID "${tagId}" not found on forum "#${channel.name}". Use list_forum_tags to see available tags.`
    );
  }

  const updatedTags = [...existingTags] as any[];
  const tag = { ...updatedTags[tagIndex] };

  if (name !== undefined) tag.name = name;
  if (emoji !== undefined) tag.emoji = { name: emoji, id: null };
  if (moderated !== undefined) tag.moderated = moderated;

  updatedTags[tagIndex] = tag;

  await channel.setAvailableTags(updatedTags as any);

  return JSON.stringify({
    success: true,
    message: `Tag "${tag.name}" updated on forum "#${channel.name}"`,
    tag: {
      id: tag.id,
      name: tag.name,
      emoji: tag.emoji,
      moderated: tag.moderated,
    },
  }, null, 2);
}

async function deleteForumTag(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const tagId = args['tagId'] as string;

  const channel = await resolveForumChannel(channelIdentifier);
  const existingTags = channel.availableTags;

  const tagToDelete = existingTags.find(t => t.id === tagId);
  if (!tagToDelete) {
    throw new Error(
      `Tag with ID "${tagId}" not found on forum "#${channel.name}". Use list_forum_tags to see available tags.`
    );
  }

  const filteredTags = existingTags.filter(t => t.id !== tagId);

  await channel.setAvailableTags(filteredTags);

  return JSON.stringify({
    success: true,
    message: `Tag "${tagToDelete.name}" removed from forum "#${channel.name}"`,
    remainingTagCount: filteredTags.length,
  }, null, 2);
}
