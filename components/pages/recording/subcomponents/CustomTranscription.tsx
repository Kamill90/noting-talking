import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useRef, useState } from 'react';

export const CustomTranscription = ({ note }: { note: Doc<'customTranscriptions'> }) => {
  const [disabled, setDisabled] = useState(true);
  const textAreaRef: MutableRefObject<any> = useRef(null);

  const mutateCustomTranscriptions = useMutation(
    api.customTranscriptions.updateCustomTranscriptionsValue,
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(note.value);
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
    mutateCustomTranscriptions({ id: note._id, newValue: textAreaRef.current?.value });
    setDisabled(true);
  };

  return (
    <div className="my-10">
      <div className="mx-auto flex max-w-7xl justify-between sm:px-6 lg:px-8">
        <h4 className="text-l text-gray-400">{note.title}</h4>
        <div>
          <button className="mx-5 text-blue-400" onClick={handleCopy}>
            Copy
          </button>
          {disabled ? (
            <button className="mx-5 text-blue-400" onClick={handleEdit}>
              Edit
            </button>
          ) : (
            <button className="mx-5 text-green-400" onClick={handleSubmit}>
              Save
            </button>
          )}
        </div>
      </div>
      {disabled ? (
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{note.value}</div>
      ) : (
        <div className="mx-auto block max-w-7xl">
          <textarea
            ref={textAreaRef}
            className="mx-auto w-full resize-none border-0 px-8 pt-0"
            id="comment"
            defaultValue={note.value}
          />
        </div>
      )}
    </div>
  );
};
