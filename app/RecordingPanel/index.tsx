'use client';
import { useContext } from 'react';
import { RecordingContext } from '../RecordingContext';
import { TrashIcon, CheckIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

export const RecordingPanel = () => {
  const {
    isRecording,
    totalSeconds = 0,
    stopRecording,
    processing,
    cancelRecording,
    resumeRecording,
    pauseRecording,
    isPaused,
  } = useContext(RecordingContext);

  function formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  return (
    <div className="h-100 sticky top-0 flex w-full justify-center pt-5">
      {isRecording ? (
        <div className="border-5 align-content-center border-zinc-700 flex flex-row items-center justify-between rounded-full border bg-zinc-800 px-5 py-1 w-[350px]">
          <button
            type="button"
            className="mr-3 cursor-pointer rounded-md p-2 text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white bg-zinc-600"
            onClick={cancelRecording}
          >
            <TrashIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <div className="mr-3 h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
            <div className="text-base font-semibold text-white font-montserrat">
              {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
            </div>
          </div>

          <button
            type="button"
            className="mx-2 cursor-pointer rounded-md p-2 text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white bg-zinc-600"
            onClick={isPaused ? resumeRecording : pauseRecording}
          >
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="mx-2 cursor-pointer rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 flex items-center"
            onClick={stopRecording}
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            Done
          </button>
        </div>
      ) : (
        <div className="block min-h-8 w-[350px]" />
      )}
    </div>
  );
};