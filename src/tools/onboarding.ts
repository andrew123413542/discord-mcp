import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild } from '../discord-client.js';

/**
 * Discord server onboarding configuration tools
 */

export const onboardingTools: Tool[] = [
  {
    name: 'get_onboarding',
    description:
      'Get the Discord server onboarding configuration, including prompts, default channels, enabled status, and mode.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'edit_onboarding',
    description:
      'Update the Discord server onboarding settings. You can toggle enabled status, change mode, and set default channel IDs.',
    inputSchema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: 'Whether onboarding is enabled for the server.',
        },
        mode: {
          type: 'string',
          enum: ['onboarding_default', 'onboarding_advanced'],
          description:
            'The onboarding mode. "onboarding_default" shows onboarding to new members only; "onboarding_advanced" shows it to all members.',
        },
        defaultChannelIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of channel IDs to set as default onboarding channels.',
        },
      },
      required: [],
    },
  },
];

export async function executeOnboardingTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case 'get_onboarding':
      return await getOnboarding();
    case 'edit_onboarding':
      return await editOnboarding(args);
    default:
      throw new Error(`Unknown onboarding tool: ${name}`);
  }
}

async function getOnboarding(): Promise<string> {
  const guild = await getGuild();

  try {
    const onboarding = await guild.fetchOnboarding();

    const prompts = onboarding.prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      type: prompt.type,
      required: prompt.required,
      singleSelect: prompt.singleSelect,
      inOnboarding: prompt.inOnboarding,
      options: prompt.options.map(option => ({
        id: option.id,
        title: option.title,
        description: option.description,
        channelIds: option.channels.map(c => c.id),
        roleIds: option.roles.map(r => r.id),
        emoji: option.emoji
          ? { id: option.emoji.id, name: option.emoji.name }
          : null,
      })),
    }));

    const defaultChannelIds = onboarding.defaultChannels.map(c => c.id);

    return JSON.stringify(
      {
        success: true,
        enabled: onboarding.enabled,
        mode: onboarding.mode,
        defaultChannelIds,
        prompts,
      },
      null,
      2,
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    return JSON.stringify(
      {
        success: false,
        error: message,
        hint: 'Onboarding may not be set up for this server. The server needs the COMMUNITY feature enabled and onboarding must be configured in Server Settings.',
      },
      null,
      2,
    );
  }
}

async function editOnboarding(
  args: Record<string, unknown>,
): Promise<string> {
  const guild = await getGuild();

  try {
    // First fetch current onboarding to use as baseline
    const current = await guild.fetchOnboarding();

    const editData: Record<string, unknown> = {};

    if (typeof args['enabled'] === 'boolean') {
      editData['enabled'] = args['enabled'];
    }

    if (typeof args['mode'] === 'string') {
      // Map string values to the discord.js GuildOnboardingMode enum (0 = default, 1 = advanced)
      if (args['mode'] === 'onboarding_default') {
        editData['mode'] = 0;
      } else if (args['mode'] === 'onboarding_advanced') {
        editData['mode'] = 1;
      } else {
        return JSON.stringify(
          {
            success: false,
            error: `Invalid mode "${args['mode']}". Must be "onboarding_default" or "onboarding_advanced".`,
          },
          null,
          2,
        );
      }
    }

    if (Array.isArray(args['defaultChannelIds'])) {
      editData['defaultChannels'] = args['defaultChannelIds'] as string[];
    }

    // discord.js requires prompts to be present when editing onboarding
    // Pass through the existing prompts so they are not wiped out
    editData['prompts'] = current.prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      singleSelect: prompt.singleSelect,
      required: prompt.required,
      inOnboarding: prompt.inOnboarding,
      type: prompt.type,
      options: prompt.options.map(option => ({
        id: option.id,
        title: option.title,
        description: option.description,
        channels: option.channels.map(c => c.id),
        roles: option.roles.map(r => r.id),
        emoji: option.emoji
          ? { id: option.emoji.id, name: option.emoji.name, animated: 'animated' in option.emoji ? (option.emoji as { animated?: boolean }).animated : false }
          : undefined,
      })),
    }));

    const updated = await guild.editOnboarding(editData as Parameters<typeof guild.editOnboarding>[0]);

    const prompts = updated.prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title,
      type: prompt.type,
      required: prompt.required,
      singleSelect: prompt.singleSelect,
      inOnboarding: prompt.inOnboarding,
      options: prompt.options.map(option => ({
        id: option.id,
        title: option.title,
        description: option.description,
        channelIds: option.channels.map(c => c.id),
        roleIds: option.roles.map(r => r.id),
      })),
    }));

    const defaultChannelIds = updated.defaultChannels.map(c => c.id);

    return JSON.stringify(
      {
        success: true,
        enabled: updated.enabled,
        mode: updated.mode,
        defaultChannelIds,
        prompts,
      },
      null,
      2,
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : String(error);

    return JSON.stringify(
      {
        success: false,
        error: message,
        hint: 'Editing onboarding may fail if the server does not have COMMUNITY enabled, onboarding is not configured, or the bot lacks MANAGE_GUILD and MANAGE_ROLES permissions.',
      },
      null,
      2,
    );
  }
}
