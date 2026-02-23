import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getGuild } from '../discord-client.js';
import { smartFindChannel } from './utils.js';
import { TextChannel } from 'discord.js';

/**
 * Poll management tools
 */

export const pollTools: Tool[] = [
  {
    name: 'send_poll',
    description: 'Create a poll message in a Discord channel. Allows members to vote on a question with multiple options.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID to send the poll in (fuzzy matched)',
        },
        question: {
          type: 'string',
          description: 'The poll question to ask',
        },
        options: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of answer options (2-10 options)',
        },
        duration: {
          type: 'number',
          description: 'How long the poll should last in hours (1-768). Defaults to 24.',
        },
        multiSelect: {
          type: 'boolean',
          description: 'Whether users can select multiple options. Defaults to false.',
        },
        reason: {
          type: 'string',
          description: 'Optional reason or context for the poll',
        },
      },
      required: ['channel', 'question', 'options'],
    },
  },
  {
    name: 'get_poll_results',
    description: 'Get the current results of a poll in a Discord channel, including vote counts per option and whether the poll has ended.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID where the poll was sent (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The message ID of the poll message',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
  {
    name: 'end_poll',
    description: 'End a poll early before its scheduled duration expires.',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'The channel name or ID where the poll was sent (fuzzy matched)',
        },
        messageId: {
          type: 'string',
          description: 'The message ID of the poll message',
        },
      },
      required: ['channel', 'messageId'],
    },
  },
];

export async function executePollTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'send_poll':
      return await sendPoll(args);
    case 'get_poll_results':
      return await getPollResults(args);
    case 'end_poll':
      return await endPoll(args);
    default:
      throw new Error(`Unknown poll tool: ${name}`);
  }
}

async function sendPoll(args: Record<string, unknown>): Promise<string> {
  const channelQuery = args['channel'] as string;
  const question = args['question'] as string;
  const options = args['options'] as string[];
  const duration = (args['duration'] as number | undefined) ?? 24;
  const multiSelect = (args['multiSelect'] as boolean | undefined) ?? false;
  const reason = args['reason'] as string | undefined;

  // Validate options count
  if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
    return JSON.stringify({
      success: false,
      error: 'Poll must have between 2 and 10 options.',
    }, null, 2);
  }

  // Validate duration
  if (duration < 1 || duration > 768) {
    return JSON.stringify({
      success: false,
      error: 'Poll duration must be between 1 and 768 hours.',
    }, null, 2);
  }

  const resolved = await smartFindChannel(channelQuery);

  if (!resolved.isTextBased()) {
    return JSON.stringify({
      success: false,
      error: `Channel "${channelQuery}" is not a text-based channel.`,
    }, null, 2);
  }

  const textChannel = resolved as TextChannel;

  const message = await textChannel.send({
    poll: {
      question: { text: question },
      answers: options.map(o => ({ text: o })),
      duration,
      allowMultiselect: multiSelect,
    },
  });

  return JSON.stringify({
    success: true,
    message: `Poll created successfully in #${textChannel.name}`,
    poll: {
      messageId: message.id,
      channelId: textChannel.id,
      channelName: textChannel.name,
      question,
      options,
      duration,
      multiSelect,
      reason: reason ?? null,
    },
  }, null, 2);
}

async function getPollResults(args: Record<string, unknown>): Promise<string> {
  const channelQuery = args['channel'] as string;
  const messageId = args['messageId'] as string;

  const resolved = await smartFindChannel(channelQuery);

  if (!resolved.isTextBased()) {
    return JSON.stringify({
      success: false,
      error: `Channel "${channelQuery}" is not a text-based channel.`,
    }, null, 2);
  }

  const textChannel = resolved as TextChannel;
  const message = await textChannel.messages.fetch(messageId);

  if (!message) {
    return JSON.stringify({
      success: false,
      error: `Message with ID "${messageId}" not found in #${textChannel.name}.`,
    }, null, 2);
  }

  if (!message.poll) {
    return JSON.stringify({
      success: false,
      error: `Message "${messageId}" does not contain a poll.`,
    }, null, 2);
  }

  const poll = message.poll;

  const answers = poll.answers.map(answer => ({
    text: answer.text,
    voteCount: answer.voteCount,
  }));

  const totalVotes = answers.reduce((sum, a) => sum + a.voteCount, 0);

  return JSON.stringify({
    success: true,
    poll: {
      messageId: message.id,
      channelId: textChannel.id,
      channelName: textChannel.name,
      question: poll.question.text,
      answers,
      totalVotes,
      finalized: poll.resultsFinalized,
      multiSelect: poll.allowMultiselect,
    },
  }, null, 2);
}

async function endPoll(args: Record<string, unknown>): Promise<string> {
  const channelQuery = args['channel'] as string;
  const messageId = args['messageId'] as string;

  const resolved = await smartFindChannel(channelQuery);

  if (!resolved.isTextBased()) {
    return JSON.stringify({
      success: false,
      error: `Channel "${channelQuery}" is not a text-based channel.`,
    }, null, 2);
  }

  const textChannel = resolved as TextChannel;
  const message = await textChannel.messages.fetch(messageId);

  if (!message) {
    return JSON.stringify({
      success: false,
      error: `Message with ID "${messageId}" not found in #${textChannel.name}.`,
    }, null, 2);
  }

  if (!message.poll) {
    return JSON.stringify({
      success: false,
      error: `Message "${messageId}" does not contain a poll.`,
    }, null, 2);
  }

  if (message.poll.resultsFinalized) {
    return JSON.stringify({
      success: false,
      error: 'This poll has already ended.',
    }, null, 2);
  }

  const endedMessage = await message.poll.end();

  const answers = endedMessage.poll!.answers.map(answer => ({
    text: answer.text,
    voteCount: answer.voteCount,
  }));

  const totalVotes = answers.reduce((sum, a) => sum + a.voteCount, 0);

  return JSON.stringify({
    success: true,
    message: `Poll ended successfully in #${textChannel.name}`,
    poll: {
      messageId: endedMessage.id,
      channelId: textChannel.id,
      channelName: textChannel.name,
      question: endedMessage.poll!.question.text,
      answers,
      totalVotes,
      finalized: true,
    },
  }, null, 2);
}
