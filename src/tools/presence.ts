import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ActivityType, PresenceStatusData } from 'discord.js';
import { getClient } from '../discord-client.js';

/**
 * Bot presence and status tools
 */

export const presenceTools: Tool[] = [
  {
    name: 'set_bot_status',
    description: 'Set the bot\'s presence status and activity. You can set the online status (online, idle, dnd, invisible) and an optional activity (Playing, Watching, Listening, Competing, Streaming, Custom).',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'The online status to set',
          enum: ['online', 'idle', 'dnd', 'invisible'],
        },
        activityType: {
          type: 'string',
          description: 'The type of activity to display',
          enum: ['Playing', 'Watching', 'Listening', 'Competing', 'Streaming', 'Custom'],
        },
        activityName: {
          type: 'string',
          description: 'The activity text to display (e.g. "Managing Discord")',
        },
        streamUrl: {
          type: 'string',
          description: 'The stream URL (required for Streaming type, must be a Twitch or YouTube URL)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_bot_info',
    description: 'Get the bot\'s current information including tag, ID, avatar, status, activity, guild count, and uptime.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

export async function executePresenceTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'set_bot_status':
      return await setBotStatus(args);
    case 'get_bot_info':
      return await getBotInfo();
    default:
      throw new Error(`Unknown presence tool: ${name}`);
  }
}

const activityTypeMap: Record<string, ActivityType> = {
  Playing: ActivityType.Playing,
  Watching: ActivityType.Watching,
  Listening: ActivityType.Listening,
  Competing: ActivityType.Competing,
  Streaming: ActivityType.Streaming,
  Custom: ActivityType.Custom,
};

async function setBotStatus(args: Record<string, unknown>): Promise<string> {
  const client = getClient();

  if (!client.user) {
    return JSON.stringify({ success: false, error: 'Bot user is not available' }, null, 2);
  }

  const status = (args['status'] as PresenceStatusData) || 'online';
  const activityType = args['activityType'] as string | undefined;
  const activityName = args['activityName'] as string | undefined;
  const streamUrl = args['streamUrl'] as string | undefined;

  if (activityType === 'Streaming' && !streamUrl) {
    return JSON.stringify({
      success: false,
      error: 'streamUrl is required when activityType is "Streaming". Must be a Twitch or YouTube URL.',
    }, null, 2);
  }

  const activities: Array<{ name: string; type: ActivityType; url?: string }> = [];

  if (activityType && activityName) {
    const mappedType = activityTypeMap[activityType];
    if (mappedType === undefined) {
      return JSON.stringify({
        success: false,
        error: `Invalid activityType "${activityType}". Must be one of: ${Object.keys(activityTypeMap).join(', ')}`,
      }, null, 2);
    }

    const activity: { name: string; type: ActivityType; url?: string } = {
      name: activityName,
      type: mappedType,
    };

    if (activityType === 'Streaming' && streamUrl) {
      activity.url = streamUrl;
    }

    activities.push(activity);
  }

  client.user.setPresence({
    activities,
    status,
  });

  return JSON.stringify({
    success: true,
    status,
    activity: activities.length > 0 ? {
      type: activityType,
      name: activityName,
      url: streamUrl || undefined,
    } : null,
  }, null, 2);
}

async function getBotInfo(): Promise<string> {
  const client = getClient();

  if (!client.user) {
    return JSON.stringify({ success: false, error: 'Bot user is not available' }, null, 2);
  }

  const presence = client.user.presence;
  const activity = presence?.activities?.[0];

  const info = {
    success: true,
    tag: client.user.tag,
    id: client.user.id,
    avatarUrl: client.user.displayAvatarURL(),
    status: presence?.status || 'unknown',
    activity: activity ? {
      type: ActivityType[activity.type],
      name: activity.name,
      url: activity.url || null,
    } : null,
    guildCount: client.guilds.cache.size,
    uptime: client.uptime,
  };

  return JSON.stringify(info, null, 2);
}
