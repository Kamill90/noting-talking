'use client';
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
    <div className="h-100 sticky top-5 flex w-full justify-center">
      {isRecording ? (
        <div className="border-5 align-content-center border-black-400 flex flex-row justify-between rounded-md border bg-indigo-100 px-5 py-1">
          <button
            type="button"
            className="mx-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={cancelRecording}
          >
            Cancel
          </button>

          <div className="mx-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
          </div>

          <button
            type="button"
            className="mx-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={isPaused ? resumeRecording : pauseRecording}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            className="mx-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={stopRecording}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="block min-h-8" />
      )}
    </div>
  );
};
