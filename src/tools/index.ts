import { Tool } from '@modelcontextprotocol/sdk/types.js';

// Import all tool definitions
import { guildTools, executeGuildTool } from './guild.js';
import { roleTools, executeRoleTool } from './roles.js';
import { channelTools, executeChannelTool } from './channels.js';
import { memberTools, executeMemberTool } from './members.js';
import { messageTools, executeMessageTool } from './messages.js';
import { reactionTools, executeReactionTool } from './reactions.js';
import { serverTools, executeServerTool } from './server.js';
import { threadTools, executeThreadTool } from './threads.js';
import { emojiTools, executeEmojiTool } from './emojis.js';
import { automodTools, executeAutomodTool } from './automod.js';
import { eventTools, executeEventTool } from './events.js';
import { webhookTools, executeWebhookTool } from './webhooks.js';
import { forumTools, executeForumTool } from './forums.js';
import { stageTools, executeStageTool } from './stage.js';
import { pollTools, executePollTool } from './polls.js';
import { dmTools, executeDmTool } from './dms.js';
import { presenceTools, executePresenceTool } from './presence.js';
import { templateTools, executeTemplateTool } from './templates.js';
import { commandTools, executeCommandTool } from './commands.js';
import { onboardingTools, executeOnboardingTool } from './onboarding.js';

/**
 * All available MCP tools for Discord server management
 */
export const allTools: Tool[] = [
  ...guildTools,
  ...roleTools,
  ...channelTools,
  ...memberTools,
  ...messageTools,
  ...reactionTools,
  ...serverTools,
  ...threadTools,
  ...emojiTools,
  ...automodTools,
  ...eventTools,
  ...webhookTools,
  ...forumTools,
  ...stageTools,
  ...pollTools,
  ...dmTools,
  ...presenceTools,
  ...templateTools,
  ...commandTools,
  ...onboardingTools,
];

/**
 * Tool name to category mapping for routing
 */
const toolCategories: Record<string, string> = {};

// Map guild tools
for (const tool of guildTools) {
  toolCategories[tool.name] = 'guild';
}

// Map role tools
for (const tool of roleTools) {
  toolCategories[tool.name] = 'role';
}

// Map channel tools
for (const tool of channelTools) {
  toolCategories[tool.name] = 'channel';
}

// Map member tools
for (const tool of memberTools) {
  toolCategories[tool.name] = 'member';
}

// Map message tools
for (const tool of messageTools) {
  toolCategories[tool.name] = 'message';
}

// Map reaction tools
for (const tool of reactionTools) {
  toolCategories[tool.name] = 'reaction';
}

// Map server tools
for (const tool of serverTools) {
  toolCategories[tool.name] = 'server';
}

// Map thread tools
for (const tool of threadTools) {
  toolCategories[tool.name] = 'thread';
}

// Map emoji tools
for (const tool of emojiTools) {
  toolCategories[tool.name] = 'emoji';
}

// Map automod tools
for (const tool of automodTools) {
  toolCategories[tool.name] = 'automod';
}

// Map event tools
for (const tool of eventTools) {
  toolCategories[tool.name] = 'event';
}

// Map webhook tools
for (const tool of webhookTools) {
  toolCategories[tool.name] = 'webhook';
}

// Map forum tools
for (const tool of forumTools) {
  toolCategories[tool.name] = 'forum';
}

// Map stage tools
for (const tool of stageTools) {
  toolCategories[tool.name] = 'stage';
}

// Map poll tools
for (const tool of pollTools) {
  toolCategories[tool.name] = 'poll';
}

// Map DM tools
for (const tool of dmTools) {
  toolCategories[tool.name] = 'dm';
}

// Map presence tools
for (const tool of presenceTools) {
  toolCategories[tool.name] = 'presence';
}

// Map template tools
for (const tool of templateTools) {
  toolCategories[tool.name] = 'template';
}

// Map command tools
for (const tool of commandTools) {
  toolCategories[tool.name] = 'command';
}

// Map onboarding tools
for (const tool of onboardingTools) {
  toolCategories[tool.name] = 'onboarding';
}

/**
 * Execute a tool by name with the given arguments
 */
export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  const category = toolCategories[name];

  if (!category) {
    throw new Error(`Unknown tool: ${name}`);
  }

  switch (category) {
    case 'guild':
      return executeGuildTool(name, args);
    case 'role':
      return executeRoleTool(name, args);
    case 'channel':
      return executeChannelTool(name, args);
    case 'member':
      return executeMemberTool(name, args);
    case 'message':
      return executeMessageTool(name, args);
    case 'reaction':
      return executeReactionTool(name, args);
    case 'server':
      return executeServerTool(name, args);
    case 'thread':
      return executeThreadTool(name, args);
    case 'emoji':
      return executeEmojiTool(name, args);
    case 'automod':
      return executeAutomodTool(name, args);
    case 'event':
      return executeEventTool(name, args);
    case 'webhook':
      return executeWebhookTool(name, args);
    case 'forum':
      return executeForumTool(name, args);
    case 'stage':
      return executeStageTool(name, args);
    case 'poll':
      return executePollTool(name, args);
    case 'dm':
      return executeDmTool(name, args);
    case 'presence':
      return executePresenceTool(name, args);
    case 'template':
      return executeTemplateTool(name, args);
    case 'command':
      return executeCommandTool(name, args);
    case 'onboarding':
      return executeOnboardingTool(name, args);
    default:
      throw new Error(`Unknown tool category: ${category}`);
  }
}

/**
 * Get a tool definition by name
 */
export function getTool(name: string): Tool | undefined {
  return allTools.find(t => t.name === name);
}
