'use client';
import { CheckIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { RecordingContext } from '../RecordingContext';

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
        <div className="border-5 align-content-center flex w-[350px] flex-row items-center justify-between rounded-full border border-zinc-700 bg-zinc-800 px-5 py-1">
          <button
            type="button"
            className="mr-3 cursor-pointer rounded-md bg-red-500 bg-opacity-20 p-2 font-montserrat font-medium text-red-500 hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={cancelRecording}
          >
            Cancel
          </button>

          <div className="flex items-center">
            <div className="mr-3 h-2 w-2 animate-pulse rounded-full bg-red-600"></div>
            <div className="font-montserrat text-base font-semibold text-white">
              {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
            </div>
          </div>

          <button
            type="button"
            className="mx-2 cursor-pointer rounded-md bg-zinc-600 p-2 text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={isPaused ? resumeRecording : pauseRecording}
          >
            {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            className="mx-2 flex cursor-pointer items-center rounded-full bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            onClick={stopRecording}
          >
            <CheckIcon className="mr-1 h-5 w-5" />
            Done
          </button>
        </div>
      ) : (
        <div className="block min-h-8 w-[350px]" />
      )}
    </div>
  );
};
