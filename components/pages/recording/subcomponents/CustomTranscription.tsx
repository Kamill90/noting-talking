import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

export const CustomTranscription = ({
  note,
  onCopy,
  onRendered,
}: {
  note: {
    _id: Id<'customTranscriptions'>;
    title: string;
    value: string;
  };
  onCopy: () => void;
  onRendered: (id: string) => void;
}) => {
  const [disabled, setDisabled] = useState(true);
  const textAreaRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);
  const ref = useRef<HTMLDivElement>(null);

  const mutateCustomTranscription = useMutation(
    api.customTranscriptions.updateCustomTranscriptionsValue,
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(note.value);
    onCopy();
  };

  const handleEdit = () => {
    setDisabled(false);
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.selectionStart = textAreaRef.current.value.length;
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      }
    });
  };

  const handleSubmit = () => {
    if (textAreaRef.current) {
      mutateCustomTranscription({
        id: note._id,
        newValue: textAreaRef.current.value,
      });
    }
    setDisabled(true);
  };

  const handleCancel = () => {
    setDisabled(true);
  };

  useEffect(() => {
    if (ref.current) {
      onRendered(note._id);
    }
  }, [note._id, onRendered]);

  return (
    <div ref={ref} className="my-2 sm:my-3 pl-3 relative z-10">
      <div className="mb-2 sm:mb-4 flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-800">{note.title}</h4>
        <div className="flex space-x-2">
          {disabled ? (
            <button
              className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
              onClick={handleCopy}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </button>
          ) : (
            <>
              <button
                className="inline-flex items-center rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center rounded-md border border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-600 shadow-sm transition-colors hover:bg-green-50"
                onClick={handleSubmit}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save
              </button>
            </>
          )}
          {disabled && (
            <button
              className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
              onClick={handleEdit}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          )}
        </div>
      </div>
      {disabled ? (
        <div className="rounded-lg bg-white p-3 sm:p-4 font-normal text-zinc-700">
          <div className="whitespace-pre-wrap leading-relaxed">{note.value}</div>
        </div>
      ) : (
        <div className="mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 sm:p-4 font-normal leading-relaxed text-zinc-700 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            defaultValue={note.value}
            rows={Math.max(5, note.value.split('\n').length)}
          />
        </div>
      )}
    </div>
  );
};
