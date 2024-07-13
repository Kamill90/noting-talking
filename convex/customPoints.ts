import { ConvexError, v } from 'convex/values';
import { mutationWithUser, queryWithUser } from './utils';

export const getCustomPoints = queryWithUser({
  handler: async (ctx) => {
    const userId = ctx.userId;
    if (userId === undefined) {
      return null;
    }
    const customPoints = await ctx.db
      .query('customPoints')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
  
    return customPoints;
  },
});

export const createCustomPoint = mutationWithUser({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { title, description }) => {
    const userId = ctx.userId;
    const storedCustomPoints = await ctx.db
    .query('customPoints')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .collect();

    if(storedCustomPoints.find(point=>point.title===title)) {
      return console.error('duplicates are prohibited')
    }
    
    const customPoint = await ctx.db.insert('customPoints', {
      userId,
      title,
      description
    });
    return customPoint;
  },
});

export const deleteCustomPoint = mutationWithUser({
  args: {
    id: v.id('customPoints'),
  },
  handler: async (ctx, { id }) => {
    const userId = ctx.userId;

    const existing = await ctx.db.get(id);
    if (existing) {
      if (existing.userId !== userId) {
        throw new ConvexError('Not your customPoint');
      }
      await ctx.db.delete(id);
    }
  },
});