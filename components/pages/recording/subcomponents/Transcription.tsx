import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Copy, Edit, Save, X } from 'lucide-react';

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
    <div className="my-8 border-t border-border pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-md font-semibold text-foreground">{Title[target]}</h4>
        <div className="flex space-x-2">
          {disabled ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={handleCopy}
              >
                <Copy className="mr-1 h-4 w-4" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={handleEdit}
              >
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleCancel}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={handleSubmit}
              >
                <Save className="mr-1 h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>
      {disabled ? (
        <div className="rounded-lg bg-muted/50 p-6 text-foreground leading-relaxed">{text}</div>
      ) : (
        <div className="mt-4">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-lg border border-input bg-background p-6 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            id="comment"
            defaultValue={text}
          />
        </div>
      )}
    </div>
  );
};
