import Instructor from '@instructor-ai/instructor';
import { v } from 'convex/values';
import OpenAI from 'openai';
import { z } from 'zod';
import { internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery } from './_generated/server';
import { GeneratingValue } from './notes';

const openAIApiKey = process.env.OPEN_AI_API_KEY ?? 'undefined';

const openAI = new OpenAI({
  apiKey: openAIApiKey,
});

export const client = Instructor({
  client: openAI,
  mode: 'JSON_SCHEMA',
});

export const chat = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const { transcript } = args;

    try {
      const extract = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: 'system',
            content:
              'The following is a transcript of a voice message. Extract a title, summary (summary should be max 20 words long) from it and answer in JSON in this format: {title: string, summary: string}',
          },
          { role: 'user', content: transcript },
        ],
        response_format: {
          "type": "text"
        },
        temperature: 0.6,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      });

      const response = extract.choices.find(choice => choice.message.role === 'assistant')
      const modifiedTranscript = response?.message.content || '';
      const {summary, title} = JSON.parse(modifiedTranscript) 
      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        summary,
        title,
      });
    } catch (e) {
      console.error('Error extracting from voice message', e);
      await ctx.runMutation(internal.together.saveSummary, {
        id: args.id,
        summary: 'Summary failed to generate',
        title: 'Title',
      });
    }
  },
});

export const TransformationSchema = z.object({
  modifiedTranscript: z.string().describe('new modified transcription').max(1000),
});

export const transformTranscript = internalAction({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
    target: v.union(v.literal('tweet'), v.literal('blogPost'), v.literal('transcription')),
  },
  handler: async (ctx, args) => {
    const { transcript, target } = args;

    try {
      const extract = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `The following is a transcript of a voice message. Transform given transcript to be useful as ${target}, taking under consideration limitation related with it. Answer in JSON in this format: {modifiedTranscript: string}`,
          },
          { role: 'user', content: transcript },
        ],
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        response_model: { schema: TransformationSchema, name: 'TransformedNote' },
        max_tokens: 1000,
        temperature: 0.6,
        max_retries: 3,
      });
      const { modifiedTranscript } = extract;

      await ctx.runMutation(internal.together.saveTarget, {
        id: args.id,
        target,
        value: modifiedTranscript,
      });
    } catch (e) {
      console.error('Error transforming transcript for targeted purpose', e);
    }
  },
});

export const getTranscript = internalQuery({
  args: {
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    const note = await ctx.db.get(id);
    return note?.transcription;
  },
});

export const saveSummary = internalMutation({
  args: {
    id: v.id('notes'),
    summary: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, summary, title } = args;
    await ctx.db.patch(id, {
      summary: summary,
      title: title,
      generatingTitle: false,
    });

    let note = await ctx.db.get(id);

    if (!note) {
      console.error(`Couldn't find note ${id}`);
      return;
    }
  },
});

export const saveTarget = internalMutation({
  args: {
    id: v.id('notes'),
    target: v.union(v.literal('tweet'), v.literal('blogPost'), v.literal('transcription')),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, target, value } = args;

    const field = GeneratingValue[target];
    await ctx.db.patch(id, {
      [target]: value,
      [field]: false,
    });

    let note = await ctx.db.get(id);

    if (!note) {
      console.error(`Couldn't find note ${id}`);
      return;
    }
  },
});

export type SearchResult = {
  id: string;
  score: number;
};
