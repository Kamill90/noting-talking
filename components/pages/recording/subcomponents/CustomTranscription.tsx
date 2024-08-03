import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useRef, useState } from 'react';

export const CustomTranscription = ({
  note,
  onCopy,
}: {
  note: {
    _id: Id<'customTranscriptions'>;
    title: string;
    value: string;
  };
  onCopy: () => void;
}) => {
  const [disabled, setDisabled] = useState(true);
  const textAreaRef: MutableRefObject<HTMLTextAreaElement | null> = useRef(null);

  const mutateCustomTranscription = useMutation(api.customTranscriptions.updateCustomTranscriptionsValue);

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
        newValue: textAreaRef.current.value
      });
    }
    setDisabled(true);
  };

  const handleCancel = () => {
    setDisabled(true);
  };

  return (
    <div className="pl-4 my-10">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md text-zinc-800 font-semibold">{note.title}</h4>
        <div>
          {disabled ? (
            <button className="px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md" onClick={handleCopy}>
              Copy
            </button>
          ) : (
            <>
              <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md mr-2" onClick={handleCancel}>
                Cancel
              </button>
              <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md" onClick={handleSubmit}>
                Save
              </button>
            </>
          )}
          {disabled && (
            <button className="px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md ml-2" onClick={handleEdit}>
              Edit
            </button>
          )}
        </div>
      </div>
      {disabled ? (
        <div className="mt-2 text-zinc-800">{note.value}</div>
      ) : (
        <div className="mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            defaultValue={note.value}
          />
        </div>
      )}
    </div>
  );
};