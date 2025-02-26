import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import { MutableRefObject, useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/shadcn/button';
import { Copy, Edit, Save, X } from 'lucide-react';

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
    <div ref={ref} className="my-8 border-t border-border pt-8">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-md font-semibold text-foreground">{note.title}</h4>
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
        <div className="rounded-lg bg-muted/50 p-6 text-foreground leading-relaxed">{note.value}</div>
      ) : (
        <div className="mt-4">
          <textarea
            ref={textAreaRef}
            className="w-full resize-none rounded-lg border border-input bg-background p-6 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue={note.value}
          />
        </div>
      )}
    </div>
  );
};
