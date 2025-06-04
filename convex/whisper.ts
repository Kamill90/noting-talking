('use node');

import { createClient } from '@deepgram/sdk';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation } from './_generated/server';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
const deepgram = createClient(deepgramApiKey);

const deepGramTranscription = async (url: string, diarize: boolean, selectedLanguage: string) => {
  const options: {
    model: string;
    detect_language: boolean;
    smart_format: boolean;
    diarize: boolean;
    language?: string;
  } = {
    model: 'nova-2',
    detect_language: selectedLanguage === 'auto',
    smart_format: true,
    diarize
  }
  if (selectedLanguage !== 'auto') {
    options.language = selectedLanguage;
  }
  console.log('deepGramTranscription',{options, url});

  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    {url},
    options,
  );

  if (error) {
    console.error(error);
    return {
      text: "Error occurred"
    }
  } else {

    console.log('wynik', JSON.stringify(result, null, 4));

    const transcript: string | undefined = result.results.channels[0].alternatives[0].paragraphs?.transcript
    return {
      text: transcript || 'Impossible to understand - sorry'
    }
  }
}

export const chat = internalAction({
  args: {
    fileUrl: v.string(),
    id: v.id('notes'),
    isMeeting: v.boolean(),
    selectedLanguage: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log('chat', {args})
      const transcription =  await deepGramTranscription(args.fileUrl, args.isMeeting, args.selectedLanguage)
      if(!transcription.text.length) {
        throw new Error('no transcription generated')
      }
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
  },
});
