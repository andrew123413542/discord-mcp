import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild } from '../discord-client.js';
import { smartFindChannel } from './utils.js';
import { ChannelType, StageChannel, StageInstancePrivacyLevel } from 'discord.js';

/**
 * Stage instance management tools
 */

export const stageTools: Tool[] = [
  {
    name: 'list_stage_instances',
    description: 'List all active stage instances in the Discord server. Returns details including topic, channel, and privacy level.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'start_stage',
    description: 'Start a new stage instance on a stage channel. Requires specifying a stage voice channel and a topic.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The stage channel name or ID (fuzzy matched)',
        },
        topic: {
          type: 'string',
          description: 'The topic for the stage instance',
        },
        sendNotification: {
          type: 'boolean',
          description: 'Whether to send a start notification to the server (default: false)',
        },
      },
      required: ['channel', 'topic'],
    },
  },
  {
    name: 'end_stage',
    description: 'End an active stage instance on a stage channel.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The stage channel name or ID (fuzzy matched)',
        },
      },
      required: ['channel'],
    },
  },
];

export async function executeStageTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'list_stage_instances':
      return await listStageInstances();
    case 'start_stage':
      return await startStage(args);
    case 'end_stage':
      return await endStage(args);
    default:
      throw new Error(`Unknown stage tool: ${name}`);
  }
}

function mapPrivacyLevelToString(level: StageInstancePrivacyLevel): string {
  switch (level) {
    case StageInstancePrivacyLevel.GuildOnly:
      return 'guild_only';
    default:
      return 'unknown';
  }
}

async function listStageInstances(): Promise<string> {
  const guild = await getGuild();
  const fetched = await guild.stageInstances.fetch({} as any);

  // Handle both Collection and array-like returns
  const instances = fetched instanceof Map ? Array.from(fetched.values()) : Array.isArray(fetched) ? fetched : [fetched].filter(Boolean);

  const result = instances.map(instance => {
    const channel = guild.channels.cache.get(instance.channelId);
    return {
      id: instance.id,
      topic: instance.topic,
      channelId: instance.channelId,
      channelName: channel?.name ?? null,
      privacyLevel: mapPrivacyLevelToString(instance.privacyLevel),
      discoverableDisabled: instance.discoverableDisabled,
    };
  });

  return JSON.stringify(result, null, 2);
}

async function startStage(args: Record<string, unknown>): Promise<string> {
  const guild = await getGuild();

  const channelQuery = args['channel'] as string;
  const topic = args['topic'] as string;
  const sendNotification = (args['sendNotification'] as boolean) ?? false;

  const channel = await smartFindChannel(channelQuery);

  if (channel.type !== ChannelType.GuildStageVoice) {
    throw new Error(`Channel "${channel.name}" is not a stage channel. It must be a stage voice channel.`);
  }

  try {
    const stageInstance = await guild.stageInstances.create(channel.id, {
      topic,
      privacyLevel: StageInstancePrivacyLevel.GuildOnly,
      sendStartNotification: sendNotification,
    });

    const resolvedChannel = guild.channels.cache.get(stageInstance.channelId);

    return JSON.stringify({
      success: true,
      message: `Stage instance started with topic "${stageInstance.topic}"`,
      stageInstance: {
        id: stageInstance.id,
        topic: stageInstance.topic,
        channelId: stageInstance.channelId,
        channelName: resolvedChannel?.name ?? null,
        privacyLevel: mapPrivacyLevelToString(stageInstance.privacyLevel),
        discoverableDisabled: stageInstance.discoverableDisabled,
      },
    }, null, 2);
  } catch (error: any) {
    throw new Error(`Failed to start stage instance: ${error.message}`);
  }
}

async function endStage(args: Record<string, unknown>): Promise<string> {
  const guild = await getGuild();

  const channelQuery = args['channel'] as string;
  const channel = await smartFindChannel(channelQuery);

  if (channel.type !== ChannelType.GuildStageVoice) {
    throw new Error(`Channel "${channel.name}" is not a stage channel.`);
  }

  const stageChannel = channel as StageChannel;
  let stageInstance = stageChannel.stageInstance;

  if (!stageInstance) {
    // Try fetching from guild stage instances
    try {
      stageInstance = await guild.stageInstances.fetch(channel.id);
    } catch {
      throw new Error(`No active stage instance found on channel "${channel.name}".`);
    }
  }

  if (!stageInstance) {
    throw new Error(`No active stage instance found on channel "${channel.name}".`);
  }

  const topic = stageInstance.topic;
  await guild.stageInstances.delete(channel.id);

  return JSON.stringify({
    success: true,
    message: `Stage instance with topic "${topic}" ended successfully on channel "${channel.name}"`,
  }, null, 2);
}
