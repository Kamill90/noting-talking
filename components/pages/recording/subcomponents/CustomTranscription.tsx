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
    <div ref={ref} className="my-10 pl-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-md font-semibold text-zinc-800">{note.title}</h4>
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
        <div className="mt-2 whitespace-pre-wrap text-zinc-800">{note.value}</div>
      ) : (
        <div className="mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
            defaultValue={note.value}
          />
        </div>
      )}
    </div>
  );
};
