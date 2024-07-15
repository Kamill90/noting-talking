import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';
import { TransformationSchema, client } from './together';
import { mutationWithUser, queryWithUser } from './utils';

export const getCustomTranscriptions = queryWithUser({
  args: {
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const { id } = args;
    if (ctx.userId === undefined) {
      return null;
    }
    const customTranscriptions = await ctx.db
      .query('customTranscriptions')
      .withIndex('by_noteId', (q) => q.eq('noteId', id))
      .collect();

    return { customTranscriptions };
  },
});

export const updateCustomTranscriptionsValue = mutationWithUser({
  args: {
    id: v.id('customTranscriptions'),
    newValue: v.string(),
  },
  handler: async (ctx, { id, newValue }) => {
    const customPoint = await ctx.db.patch(id, { value: newValue  });
    return customPoint;
  },
});

export const updateCustomTranscriptions = internalMutation({
  args: {
    id: v.id('customTranscriptions'),
    newValue: v.string(),
    error: v.optional(v.boolean())
  },
  handler: async (ctx, { id, newValue, error }) => {
    const otherArgs = {
      loading: false,
      error: error ?? false
    }
    const customPoint = await ctx.db.patch(id, { value: newValue, ...otherArgs  });
    return customPoint;
  },
});

export const createCustomTranscription = mutationWithUser({
  args: {
    transcript: v.string(),
    noteId: v.id('notes'),
    point: v.object({
      _id: v.string(),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      description: v.string(),
    }),
  },
  handler: async (ctx, { transcript, point, noteId }) => {
    const customTranscriptionId = await ctx.db.insert('customTranscriptions', {
      noteId,
      title: point.title,
      value: '',
      error: false,
      loading: true,
    });
    await ctx.scheduler.runAfter(0, internal.customTranscriptions.transformToCustomTranscript, {
      customTranscriptionId,
      transcript,
      point,
    });
  },
});

export const transformToCustomTranscript = internalAction({
  args: {
    customTranscriptionId: v.id('customTranscriptions'),
    transcript: v.string(),
    point: v.object({
      _id: v.string(),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      description: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { transcript, point, customTranscriptionId } = args;

    try {
      const extract = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `The following is a transcript of a voice message. Transform given transcript to be useful as ${point.description}, taking under consideration limitation related with it. Answer in JSON in this format: {modifiedTranscript: string}`,
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

      await ctx.runMutation(internal.customTranscriptions.updateCustomTranscriptions, {
        id: customTranscriptionId,
        newValue: modifiedTranscript,
        error: false,
      });
    } catch (e) {
      console.error('Error transforming transcript for targeted purpose', e);
      await ctx.runMutation(internal.customTranscriptions.updateCustomTranscriptions, {
        id: customTranscriptionId,
        newValue: '',
        error: true,
      });
    }
  },
});
