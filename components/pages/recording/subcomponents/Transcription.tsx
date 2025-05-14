import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useMemo, useRef, useState } from 'react';

enum Title {
  transcription = 'Transcription',
  tweet = 'Tweet',
  blogPost = 'Blog post',
}

export const Transcription = ({
  note,
  target,
  onCopy,
}: {
  note: Doc<'notes'>;
  target: 'transcription' | 'tweet' | 'blogPost';
  onCopy: () => void;
}) => {
  const text = useMemo(() => note[target] || '', [note, target]);

  const [disabled, setDisabled] = useState(true);
  const textAreaRef: MutableRefObject<any> = useRef(null);

  const mutateNote = useMutation(api.notes.updateNote);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    onCopy();
  };

  const handleEdit = () => {
    setDisabled(false);
    setTimeout(() => {
      textAreaRef.current?.focus();
      const textareaRef = textAreaRef.current || {};
      textareaRef.selectionStart = textAreaRef.current?.value.length;
      const scrollHeight = textAreaRef.current?.scrollHeight;

      textAreaRef.current.style.height = scrollHeight + 'px';
    });
  };

  const handleSubmit = () => {
    mutateNote({ noteId: note._id, target, transcription: textAreaRef.current?.value });
    setDisabled(true);
  };

  const handleCancel = () => {
    setDisabled(true);
  };

  return (
    <div className="my-4 sm:my-6">
      <div className="mb-2 sm:mb-4 flex items-center justify-between">
        <h4 className="text-lg font-medium text-zinc-800">{Title[target]}</h4>
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
        <div className="relative z-10 rounded-lg border border-zinc-200 bg-white p-3 sm:p-4 font-normal text-zinc-700 shadow-sm">
          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
        </div>
      ) : (
        <div className="relative z-10 mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 sm:p-4 font-normal leading-relaxed text-zinc-700 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-500"
            defaultValue={text}
            rows={Math.max(5, text.split('\n').length)}
          />
        </div>
      )}
    </div>
  );
};
