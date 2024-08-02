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
}: {
  note: Doc<'notes'>;
  target: 'transcription' | 'tweet' | 'blogPost';
}) => {
  const text = useMemo(() => note[target] || '', [note, target]);

  const [disabled, setDisabled] = useState(true);
  const textAreaRef: MutableRefObject<any> = useRef(null);

  const mutateNote = useMutation(api.notes.updateNote);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
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

  return (
    <div className="my-10">
      <div className="flex justify-between">
        <h4 className="text-md text-zinc-800 font-semibold">{Title[target]}</h4>
        <div>
          <button className="mx-5 text-sky-600" onClick={handleCopy}>
            Copy
          </button>
          {disabled ? (
            <button className="mx-5 text-sky-600" onClick={handleEdit}>
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
        <div className="mt-2">{text}</div>
      ) : (
        <div className="mt-2">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none border-0 p-0"
            id="comment"
            defaultValue={text}
          />
        </div>
      )}
    </div>
  );
};