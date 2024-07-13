import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    audioFileId: v.string(),
    audioFileUrl: v.string(),
    title: v.optional(v.string()),
    transcription: v.optional(v.string()),
    summary: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    generatingTranscript: v.boolean(),
    generatingTitle: v.boolean(),
    generatingTweet: v.boolean(),
    tweet: v.optional(v.string()),
    generatingBlogPost: v.boolean(),
    blogPost: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: 768,
      filterFields: ['userId'],
    }),
  customPoints: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.string(),
  }).index('by_userId', ['userId']),
  customTranscriptions: defineTable({
    noteId: v.string(),
    title: v.string(),
    value: v.string(),
  }).index('by_noteId', ['noteId']),
});
