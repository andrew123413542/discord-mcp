import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { EmbedBuilder, ColorResolvable, ChannelType, TextChannel, Collection, Message, AttachmentBuilder } from 'discord.js';
import { smartFindTextChannel } from './utils.js';
import { getGuild } from '../discord-client.js';

/**
 * Messaging tools - with smart fuzzy matching for channel names
 */

export const messageTools: Tool[] = [
  {
    name: 'get_message',
    description: 'Get a specific message by its ID from a channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to fetch',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'edit_message',
    description: 'Edit a message that was sent by the bot. Can only edit the bot\'s own messages.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to edit',
        },
        content: {
          type: 'string',
          description: 'The new content for the message',
        },
      },
      required: ['channel', 'messageId', 'content'],
    },
  },
  {
    name: 'crosspost_message',
    description: 'Publish (crosspost) a message from an announcement channel to all servers following it.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The announcement channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to publish',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'get_messages',
    description: 'Get recent messages from a text channel OR voice channel text chat. Supports both regular text channels and voice channel text chats. Channel name is fuzzy-matched.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched - spaces, hyphens, case don\'t matter)',
        },
        limit: {
          type: 'number',
          description: 'Number of messages to retrieve (default: 10, max: 100)',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'send_message',
    description: 'Send a text message to a text channel OR a voice channel (voice channels have built-in text chat). Supports both regular text channels and voice channel text chats. Channel name is fuzzy-matched. IMPORTANT: Before calling this tool, use list_channels to find the exact channel name.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The EXACT channel name (get from list_channels first) or channel ID. While fuzzy matching works, using exact names ensures clarity in approval prompts.',
        },
        content: {
          type: 'string',
          description: 'The message content to send',
        },
        replyTo: {
          type: 'string',
          description: 'Message ID to reply to (optional)',
        },
      },
      required: ['channel', 'content'],
    },
  },
  {
    name: 'send_embed',
    description: 'Send a rich embed message to a channel. IMPORTANT: Before calling this tool, use list_channels to find the exact channel name, then use that exact name so the user sees exactly where the embed will go.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The EXACT channel name (get from list_channels first) or channel ID',
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
        url: {
          type: 'string',
          description: 'URL to link the title to',
        },
        content: {
          type: 'string',
          description: 'Optional text content to send alongside the embed',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'bulk_delete_messages',
    description: 'Delete multiple messages from a channel at once (2-100 messages). Only works on messages less than 14 days old.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        count: {
          type: 'number',
          description: 'Number of messages to delete (2-100)',
        },
        userId: {
          type: 'string',
          description: 'Optional: only delete messages from this user ID',
        },
      },
      required: ['channel', 'count'],
    },
  },
  {
    name: 'pin_message',
    description: 'Pin a message in a channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to pin',
        },
        reason: {
          type: 'string',
          description: 'The reason for pinning (shown in audit log)',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'unpin_message',
    description: 'Unpin a message in a channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to unpin',
        },
        reason: {
          type: 'string',
          description: 'The reason for unpinning (shown in audit log)',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'list_pinned_messages',
    description: 'Get all pinned messages in a channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
      },
      required: ['channel'],
    },
  },
  {
    name: 'add_reaction',
    description: 'Add a reaction (from the bot) to a message.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to react to',
        },
        emoji: {
          type: 'string',
          description: 'The emoji to react with (e.g., "👍" or a custom emoji name)',
        },
      },
      required: ['channel', 'messageId', 'emoji'],
    },
  },
  {
    name: 'remove_reaction',
    description: 'Remove the bot\'s reaction from a message.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to remove the reaction from',
        },
        emoji: {
          type: 'string',
          description: 'The emoji to remove (e.g., "👍" or a custom emoji name)',
        },
      },
      required: ['channel', 'messageId', 'emoji'],
    },
  },
  {
    name: 'delete_message',
    description: 'Delete a message from a channel by its message ID.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The ID of the message to delete',
        },
        reason: {
          type: 'string',
          description: 'The reason for deleting the message (for audit purposes)',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'send_message_with_file',
    description: 'Send a message with a file attachment to a channel. The file can be specified by URL.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: { type: 'string', description: 'Channel name, ID, or mention' },
        content: { type: 'string', description: 'Message text content (optional if file is provided)' },
        fileUrl: { type: 'string', description: 'URL of the file to attach' },
        fileName: { type: 'string', description: 'Name for the attached file (e.g. "image.png")' },
      },
      required: ['channel', 'fileUrl'],
    },
  },
];

export async function executeMessageTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'get_message':
      return await getMessage(args);
    case 'edit_message':
      return await editMessage(args);
    case 'crosspost_message':
      return await crosspostMessage(args);
    case 'get_messages':
      return await getMessages(args);
    case 'send_message':
      return await sendMessage(args);
    case 'send_embed':
      return await sendEmbed(args);
    case 'delete_message':
      return await deleteMessage(args);
    case 'bulk_delete_messages':
      return await bulkDeleteMessages(args);
    case 'pin_message':
      return await pinMessage(args);
    case 'unpin_message':
      return await unpinMessage(args);
    case 'list_pinned_messages':
      return await listPinnedMessages(args);
    case 'add_reaction':
      return await addReaction(args);
    case 'remove_reaction':
      return await removeReaction(args);
    case 'send_message_with_file':
      return await sendMessageWithFile(args);
    default:
      throw new Error(`Unknown message tool: ${name}`);
  }
}

async function getMessages(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const limit = Math.min(args['limit'] as number || 10, 100);

  const channel = await smartFindTextChannel(channelIdentifier);
  const messages = await channel.messages.fetch({ limit });

  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;

  const messageList = messages
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map(msg => ({
      id: msg.id,
      content: msg.content || '(no text content)',
      author: {
        id: msg.author.id,
        username: msg.author.username,
        isBot: msg.author.bot,
      },
      createdAt: msg.createdAt.toISOString(),
      editedAt: msg.editedAt?.toISOString() ?? null,
      hasEmbeds: msg.embeds.length > 0,
      hasAttachments: msg.attachments.size > 0,
      replyTo: msg.reference?.messageId ?? null,
    }));

  return JSON.stringify({
    channel: {
      id: channel.id,
      name: channel.name,
      type: isVoice ? 'voice' : 'text',
    },
    messageCount: messageList.length,
    messages: messageList,
  }, null, 2);
}

async function sendMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const content = args['content'] as string;
  const replyTo = args['replyTo'] as string | undefined;

  const channel = await smartFindTextChannel(channelIdentifier);

  const messageOptions: { content: string; reply?: { messageReference: string } } = { content };

  if (replyTo) {
    messageOptions.reply = { messageReference: replyTo };
  }

  const message = await channel.send(messageOptions);

  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
  const channelPrefix = isVoice ? '🔊' : '#';

  return JSON.stringify({
    success: true,
    message: `Message sent to ${channelPrefix}${channel.name}`,
    sentMessage: {
      id: message.id,
      content: message.content,
      channel: {
        id: channel.id,
        name: channel.name,
        type: isVoice ? 'voice' : 'text',
      },
      createdAt: message.createdAt.toISOString(),
    },
  }, null, 2);
}

async function sendEmbed(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);

  const embed = new EmbedBuilder();

  if (args['title']) embed.setTitle(args['title'] as string);
  if (args['description']) embed.setDescription(args['description'] as string);
  if (args['color']) embed.setColor(args['color'] as ColorResolvable);
  if (args['url']) embed.setURL(args['url'] as string);
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

  const messageOptions: { embeds: EmbedBuilder[]; content?: string } = { embeds: [embed] };
  if (args['content']) {
    messageOptions.content = args['content'] as string;
  }

  const message = await channel.send(messageOptions);

  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
  const channelPrefix = isVoice ? '🔊' : '#';

  return JSON.stringify({
    success: true,
    message: `Embed sent to ${channelPrefix}${channel.name}`,
    sentMessage: {
      id: message.id,
      channel: {
        id: channel.id,
        name: channel.name,
        type: isVoice ? 'voice' : 'text',
      },
      createdAt: message.createdAt.toISOString(),
    },
  }, null, 2);
}

async function deleteMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
  const channelPrefix = isVoice ? '🔊' : '#';

  try {
    const message = await channel.messages.fetch(messageId);
    await message.delete();

    return JSON.stringify({
      success: true,
      message: `Message ${messageId} deleted from ${channelPrefix}${channel.name}`,
    }, null, 2);
  } catch (error) {
    if ((error as any).code === 10008) {
      throw new Error(`Message ${messageId} not found in ${channelPrefix}${channel.name}`);
    }
    throw error;
  }
}

async function bulkDeleteMessages(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const count = Math.min(Math.max(args['count'] as number || 2, 2), 100);
  const userId = args['userId'] as string | undefined;

  const channel = await smartFindTextChannel(channelIdentifier);

  if (userId) {
    // Fetch messages then filter by user
    const messages = await channel.messages.fetch({ limit: 100 });
    const userMessages = messages.filter(m => m.author.id === userId);
    const toDelete = [...userMessages.values()].slice(0, count);

    if (toDelete.length === 0) {
      throw new Error(`No messages found from user ${userId} in #${channel.name}`);
    }

    const deleted = await (channel as TextChannel).bulkDelete(toDelete, true);

    return JSON.stringify({
      success: true,
      message: `Deleted ${deleted.size} messages from user ${userId} in #${channel.name}`,
      deletedCount: deleted.size,
    }, null, 2);
  }

  const deleted = await (channel as TextChannel).bulkDelete(count, true);

  return JSON.stringify({
    success: true,
    message: `Deleted ${deleted.size} messages from #${channel.name}`,
    deletedCount: deleted.size,
  }, null, 2);
}

async function pinMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;
  const reason = args['reason'] as string | undefined;

  const channel = await smartFindTextChannel(channelIdentifier);
  const message = await channel.messages.fetch(messageId);
  await message.pin(reason);

  return JSON.stringify({
    success: true,
    message: `Message ${messageId} pinned in #${channel.name}`,
  }, null, 2);
}

async function unpinMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;
  const reason = args['reason'] as string | undefined;

  const channel = await smartFindTextChannel(channelIdentifier);
  const message = await channel.messages.fetch(messageId);
  await message.unpin(reason);

  return JSON.stringify({
    success: true,
    message: `Message ${messageId} unpinned in #${channel.name}`,
  }, null, 2);
}

async function listPinnedMessages(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const pinned = await channel.messages.fetchPinned();

  const pinnedList = pinned
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .map(msg => ({
      id: msg.id,
      content: msg.content || '(no text content)',
      author: {
        id: msg.author.id,
        username: msg.author.username,
        isBot: msg.author.bot,
      },
      createdAt: msg.createdAt.toISOString(),
      hasEmbeds: msg.embeds.length > 0,
      hasAttachments: msg.attachments.size > 0,
    }));

  return JSON.stringify({
    channel: { id: channel.id, name: channel.name },
    pinnedCount: pinnedList.length,
    messages: [...pinnedList],
  }, null, 2);
}

async function addReaction(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;
  const emoji = args['emoji'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const message = await channel.messages.fetch(messageId);

  // Try direct emoji first, then search guild emojis by name
  try {
    await message.react(emoji);
  } catch {
    const guild = await getGuild();
    const guildEmoji = guild.emojis.cache.find(e => e.name?.toLowerCase() === emoji.toLowerCase());
    if (guildEmoji) {
      await message.react(guildEmoji);
    } else {
      throw new Error(`Could not find emoji "${emoji}". Use a unicode emoji or the exact name of a custom server emoji.`);
    }
  }

  return JSON.stringify({
    success: true,
    message: `Reacted with ${emoji} on message ${messageId} in #${channel.name}`,
  }, null, 2);
}

async function removeReaction(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;
  const emoji = args['emoji'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const message = await channel.messages.fetch(messageId);

  // Find the bot's reaction and remove it
  const reaction = message.reactions.cache.find(r => {
    const name = r.emoji.name?.toLowerCase() ?? '';
    return name === emoji.toLowerCase() || r.emoji.toString() === emoji;
  });

  if (!reaction) {
    throw new Error(`No reaction "${emoji}" found on message ${messageId}`);
  }

  await reaction.users.remove(message.client.user!.id);

  return JSON.stringify({
    success: true,
    message: `Removed ${emoji} reaction from message ${messageId} in #${channel.name}`,
  }, null, 2);
}

async function getMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const msg = await channel.messages.fetch(messageId);

  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;

  return JSON.stringify({
    channel: {
      id: channel.id,
      name: channel.name,
      type: isVoice ? 'voice' : 'text',
    },
    message: {
      id: msg.id,
      content: msg.content || '(no text content)',
      author: {
        id: msg.author.id,
        username: msg.author.username,
        isBot: msg.author.bot,
      },
      createdAt: msg.createdAt.toISOString(),
      editedAt: msg.editedAt?.toISOString() ?? null,
      hasEmbeds: msg.embeds.length > 0,
      embeds: msg.embeds.map(e => ({
        title: e.title,
        description: e.description,
        url: e.url,
        color: e.hexColor,
        fields: e.fields.map(f => ({ name: f.name, value: f.value, inline: f.inline })),
        footer: e.footer?.text ?? null,
        image: e.image?.url ?? null,
        thumbnail: e.thumbnail?.url ?? null,
      })),
      hasAttachments: msg.attachments.size > 0,
      attachments: msg.attachments.map(a => ({
        id: a.id,
        name: a.name,
        url: a.url,
        size: a.size,
        contentType: a.contentType,
      })),
      replyTo: msg.reference?.messageId ?? null,
      pinned: msg.pinned,
      reactions: msg.reactions.cache.map(r => ({
        emoji: r.emoji.toString(),
        count: r.count,
      })),
    },
  }, null, 2);
}

async function editMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;
  const content = args['content'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);
  const msg = await channel.messages.fetch(messageId);

  if (msg.author.id !== msg.client.user!.id) {
    throw new Error(`Cannot edit message ${messageId} — it was not sent by the bot`);
  }

  const edited = await msg.edit(content);

  return JSON.stringify({
    success: true,
    message: `Message ${messageId} edited in #${channel.name}`,
    editedMessage: {
      id: edited.id,
      content: edited.content,
      editedAt: edited.editedAt?.toISOString() ?? null,
    },
  }, null, 2);
}

async function sendMessageWithFile(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const content = args['content'] as string | undefined;
  const fileUrl = args['fileUrl'] as string;
  const fileName = args['fileName'] as string | undefined;

  const channel = await smartFindTextChannel(channelIdentifier);

  const attachment = new AttachmentBuilder(fileUrl, { name: fileName ?? undefined });

  const messageOptions: { content?: string; files: AttachmentBuilder[] } = {
    files: [attachment],
  };

  if (content) {
    messageOptions.content = content;
  }

  const message = await channel.send(messageOptions);

  const isVoice = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice;
  const channelPrefix = isVoice ? '🔊' : '#';

  return JSON.stringify({
    success: true,
    message: `Message with file sent to ${channelPrefix}${channel.name}`,
    sentMessage: {
      id: message.id,
      content: message.content || null,
      channel: {
        id: channel.id,
        name: channel.name,
        type: isVoice ? 'voice' : 'text',
      },
      attachments: message.attachments.map(a => ({
        id: a.id,
        name: a.name,
        url: a.url,
        size: a.size,
        contentType: a.contentType,
      })),
      createdAt: message.createdAt.toISOString(),
    },
  }, null, 2);
}

async function crosspostMessage(args: Record<string, unknown>): Promise<string> {
  const channelIdentifier = args['channel'] as string;
  const messageId = args['messageId'] as string;

  const channel = await smartFindTextChannel(channelIdentifier);

  if (channel.type !== ChannelType.GuildAnnouncement) {
    throw new Error(`#${channel.name} is not an announcement channel — crossposting only works in announcement channels`);
  }

  const msg = await channel.messages.fetch(messageId);
  await msg.crosspost();

  return JSON.stringify({
    success: true,
    message: `Message ${messageId} published from #${channel.name} to all followers`,
  }, null, 2);
}
