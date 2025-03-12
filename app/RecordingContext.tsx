'use client';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { createContext, ReactNode, useEffect, useRef, useState } from 'react';

// Define the shape of the context state
interface RecordingContextType {
  isRecording: boolean;
  isPaused: boolean;
  stopRecording: () => void;
  startRecording: (includeDeviceAudio: boolean) => void;
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);
  console.log({ mediaRecorderRef, audioChunksRef, audioContextRef, screenStreamRef });
  const initMediaRecorder = async (includeDeviceAudio: boolean) => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const screenStream =
        includeDeviceAudio && (await navigator.mediaDevices.getDisplayMedia({ audio: true }));
      screenStreamRef.current = screenStream || null;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const systemSource =
        includeDeviceAudio && screenStream && audioContext.createMediaStreamSource(screenStream);
      const micSource = audioContext.createMediaStreamSource(micStream);
      const destination = audioContext.createMediaStreamDestination();

      micSource.connect(destination);
      if (includeDeviceAudio && systemSource) {
        systemSource.connect(destination);
      }

      const mixedStream = destination.stream;
      mediaRecorderRef.current = new MediaRecorder(mixedStream);

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
          await createNote({ storageId, isMeeting: includeDeviceAudio });
        }
      };
    } catch (err) {
      console.error('Error accessing audio sources', err);
    }
  };

  useEffect(() => {
    if (!isRecording && !isPaused) {
      console.log('resetting');
      audioChunksRef.current = [];
    }
  });

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

  const startRecording = async (includeDeviceAudio: boolean) => {
    await initMediaRecorder(includeDeviceAudio);
    audioChunksRef.current = [];
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
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .then(() => {
            audioContextRef.current = null;
          })
          .catch((err) => console.error('Błąd zamykania AudioContext:', err));
      }

      mediaRecorderRef.current = null;
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
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
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current
          .close()
          .catch((err) => console.error('Błąd zamykania AudioContext:', err))
          .finally(() => (audioContextRef.current = null));
      }

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });
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
