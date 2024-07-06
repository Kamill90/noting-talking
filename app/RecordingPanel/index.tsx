'use client';
import { StopIcon, StopwatchIcon } from '@radix-ui/react-icons';
import { useContext } from 'react';
import { RecordingContext } from '../RecordingContext';

export const RecordingPanel = () => {
  const { isRecording, totalSeconds, stopRecording, processing } = useContext(RecordingContext);

  function formatTime(time: number): string {
    return time < 10 ? `0${time}` : `${time}`;
  }

  return (
    <div className="h-100 sticky top-5 flex w-full justify-center">
      {isRecording ? (
        <div className="border-5 align-content-center border-black-400 flex flex-row justify-between rounded-full border bg-white px-5 py-1">
          <div className="mr-5" onClick={stopRecording}>
            {!processing ? 'Recording...' : 'Processing...'}
          </div>
          {!!totalSeconds && !processing && (
            <div className="flex flex-row">
              <StopwatchIcon
                className="mr-2 h-5 w-5 self-center text-blue-400"
                aria-hidden="true"
              />
              {formatTime(Math.floor(totalSeconds / 60))}:{formatTime(totalSeconds % 60)}
            </div>
          )}
          {!processing && (
            <button onClick={stopRecording}>
              <StopIcon className="text-black-400 ml-5 h-5 w-5 self-center" />
            </button>
          )}
        </div>
      ) : (
        <div className="block min-h-8" />
      )}
    </div>
  );
};
