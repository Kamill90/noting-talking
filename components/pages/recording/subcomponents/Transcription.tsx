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
    <div className="my-10">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-md font-semibold text-zinc-800">{Title[target]}</h4>
        <div>
          {disabled ? (
            <button
              className="rounded-md px-3 py-1 text-sm text-sky-600 hover:bg-sky-50"
              onClick={handleCopy}
            >
              Copy
            </button>
          ) : (
            <>
              <button
                className="mr-2 rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="rounded-md px-3 py-1 text-sm text-green-600 hover:bg-green-50"
                onClick={handleSubmit}
              >
                Save
              </button>
            </>
          )}
          {disabled && (
            <button
              className="ml-2 rounded-md px-3 py-1 text-sm text-sky-600 hover:bg-sky-50"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {disabled ? (
        <div className="mt-2 text-zinc-800">{text}</div>
      ) : (
        <div className="mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
            id="comment"
            defaultValue={text}
          />
        </div>
      )}
    </div>
  );
};
