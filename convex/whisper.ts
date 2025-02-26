('use node');

import { v } from 'convex/values';
import OpenAI, { toFile } from 'openai';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ExtendedFilePropertyBag extends FilePropertyBag {
  contentType?: string;
}

export const chat = internalAction({
  args: {
    fileUrl: v.string(),
    id: v.id('notes'),
  },
  handler: async (ctx, args) => {
    try {
      var audio_file = await fetch(args.fileUrl);
      const transcription = await openai.audio.transcriptions.create({
        file: await toFile(audio_file, 'audio.wav', {
          contentType: 'audio/wav',
        } as ExtendedFilePropertyBag),
        model: 'whisper-1',
      });

      await ctx.runMutation(internal.whisper.saveTranscript, {
        id: args.id,
        transcript: transcription.text,
        transcriptOnly: false,
      });
    } catch (error) {
      console.log('error', error);
      //TODO do something with it
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
