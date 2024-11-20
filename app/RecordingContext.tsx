'use client';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { ReactNode, createContext, useEffect, useRef, useState } from 'react';

// Define the shape of the context state
interface RecordingContextType {
  isRecording: boolean;
  isPaused: boolean;
  stopRecording: () => void;
  startRecording: () => void;
  cancelRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  totalSeconds?: number;
  processing: boolean;
}

const defaultState = {
  isRecording: false,
  isPaused: false,
  stopRecording: () => {},
  cancelRecording: () => {},
  startRecording: () => {},
  pauseRecording: () => {},
  resumeRecording: () => {},
  totalSeconds: undefined,
  processing: false,
};

// Create the context with a default value
export const RecordingContext = createContext<RecordingContextType>(defaultState);

// Create a provider component
export const RecordingContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const { user } = useUser();
  const intervalRef = useRef<NodeJS.Timeout>();

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);

  const router = useRouter();

  const initMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });

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

          // router.push(`/recording/${noteId}`);
        }
      };
    } catch (err) {
      console.error('Error accessing microphone', err);
    }
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prevTotalSeconds) => prevTotalSeconds + 1);
      }, 1000);
    }
    if (!isRecording && !isPaused) {
      setTotalSeconds(0);
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    await initMediaRecorder();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {};
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  return (
    <RecordingContext.Provider
      value={{
        totalSeconds,
        stopRecording,
        startRecording,
        cancelRecording,
        resumeRecording,
        pauseRecording,
        isRecording,
        processing: false, // to do
        isPaused,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};
