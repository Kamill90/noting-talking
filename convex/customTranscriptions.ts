import { v } from 'convex/values';
import { queryWithUser } from './utils';

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