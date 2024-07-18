('use node');

import { v } from 'convex/values';
import Replicate from 'replicate';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

interface whisperOutput {
  detected_language: string;
  segments: any;
  transcription: string;
  translation: string | null;
}

export const chat = internalAction({
  args: {
    fileUrl: v.string(),
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    try {
      const replicateOutput = (await replicate.run(
        'openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
        {
          input: {
            audio: args.fileUrl,
            model: "medium",
            translate: false
          }
        }
      )) as whisperOutput;
      const transcript = replicateOutput.transcription || 'error';
  
      await ctx.runMutation(internal.whisper.saveTranscript, {
        id: args.id,
        transcript,
        transcriptOnly: false,
      });
    } catch(error) {
      // setError()
    }
  },
});

export const saveTranscript = internalMutation({
  args: {
    id: v.id('notes'),
    transcript: v.string(),
    transcriptOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, transcript } = args;

    await ctx.db.patch(id, {
      transcription: transcript,
      generatingTranscript: false,
    });

    if (args.transcriptOnly) {
      return;
    }

    await ctx.scheduler.runAfter(0, internal.together.chat, {
      id: args.id,
      transcript,
    });

    await ctx.scheduler.runAfter(0, internal.together.embed, {
      id: args.id,
      transcript: transcript,
    });
  },
});
