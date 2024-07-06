'use client';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { ReactNode, createContext, useEffect, useState } from 'react';

// Define the shape of the context state
interface RecordingContextType {
  isRecording: boolean;
  stopRecording: () => void;
  startRecording: () => void;
  totalSeconds?: number;
  processing: boolean
}

const defaultState = {
  isRecording: false,
  stopRecording: () => {},
  startRecording: () => {},
  totalSeconds: undefined,
  processing: false
};

// Create the context with a default value
export const RecordingContext = createContext<RecordingContextType>(defaultState);

// Create a provider component
export const RecordingContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [processing, setProcessing] = useState(false)
  const [totalSeconds, setTotalSeconds] = useState(0);

  const { user } = useUser();

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);

  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let audioChunks: any = [];

    recorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'audio/mp3' },
        body: audioBlob,
      });
      const { storageId } = await result.json();

      if (user) {
        let noteId = await createNote({
          storageId,
        });

        router.push(`/recording/${noteId}`);
      }
    };
    setMediaRecorder(recorder);
    recorder.start();
  };

  const stopRecording = () => {
    // @ts-ignore
    mediaRecorder.stop();
    setMediaRecorder(null)
    setProcessing(true)
    setTimeout(() => {
      setIsRecording(false);
      setProcessing(false)
    }, 3000);
  };

  return (
    <RecordingContext.Provider value={{ totalSeconds, stopRecording, startRecording, isRecording, processing }}>
      {children}
    </RecordingContext.Provider>
  );
};
