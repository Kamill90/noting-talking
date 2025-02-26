import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Transcription } from './subcomponents/Transcription';
import InlineLoader from '@/components/ui/InlineLoader';
import { Button } from '@/components/ui/shadcn/button';
import { ArrowLeft, Home, Plus, X, ChevronUp, Sparkles } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';
import Dialog from './subcomponents/Dialog';
import { DEFAULT_POINTS } from '@/lib/const';
import { sendGAEvent } from '@next/third-parties/google';
import { useAuth } from '@clerk/nextjs';
import { CustomTranscription } from './subcomponents/CustomTranscription';

export const RecordingMobile = ({ noteId }: { noteId: Id<'notes'> }) => {
  const router = useRouter();
  const { userId } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const noteData = useQuery(api.notes.getNote, { id: noteId });
  const customTranscriptionsData = useQuery(api.customTranscriptions.getCustomTranscriptions, { id: noteId });
  const customPointsData = useQuery(api.customPoints.getCustomPoints, {});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [renderedTranscriptions, setRenderedTranscriptions] = useState<Set<string>>(new Set());

  const createCustomTranscription = useMutation(api.customTranscriptions.createCustomTranscription);
  const addCustomPoint = useMutation(api.customPoints.createCustomPoint);

  // Add default points if none exist
  useEffect(() => {
    if (customPointsData && customPointsData.length === 0) {
      DEFAULT_POINTS.forEach(point => {
        addCustomPoint({
          title: point.title,
          description: point.description
        });
      });
    }
  }, [customPointsData, addCustomPoint]);

  useEffect(() => {
    if (noteData && noteData.note && !noteData.note.transcription) {
      router.push('/dashboard');
    }
  }, [noteData, router]);

  const handleCopy = () => {
    setToastMessage('Copied to clipboard');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openDialog = () => {
    sendGAEvent('event', 'open_custom_point_dialog');
    setIsDialogOpen(true);
    setIsMenuOpen(false);
  };

  const closeDialog = () => {
    sendGAEvent('event', 'close_custom_point_dialog');
    setIsDialogOpen(false);
  };

  const submitDialog = (title: string, description: string) => {
    sendGAEvent('event', 'create_custom_point', { title });
    addCustomPoint({
      title,
      description
    });
    setToastMessage('Custom point added');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreateContent = (point: any) => {
    if (noteData && noteData.note) {
      setIsCreating(true);
      sendGAEvent('event', 'create_custom_transcription', { point_title: point.title });

      // Create a complete point object with all required fields
      const pointData = {
        _id: point._id || `temp-${Date.now()}`,
        _creationTime: Date.now(),
        userId: userId || '',
        title: point.title,
        description: point.description
      };

      createCustomTranscription({
        noteId: noteData.note._id,
        transcript: noteData.note.transcription || '',
        point: pointData,
      });

      setIsMenuOpen(false);

      // Show toast notification
      setToastMessage(`Creating ${point.title.toLowerCase()}...`);
      setShowToast(true);

      // Hide toast after a delay
      setTimeout(() => {
        setShowToast(false);
        setIsCreating(false);
      }, 3000);
    }
  };

  const handleCustomTranscriptionRendered = (id: string) => {
    setRenderedTranscriptions((prev) => new Set(prev).add(id));
  };

  if (!noteData || !noteData.note) {
    return (
      <div className="flex h-screen items-center justify-center">
        <InlineLoader text="Loading..." className="h-8 w-8 fill-primary text-muted" />
      </div>
    );
  }

  const note = noteData.note;
  const customTranscriptions = customTranscriptionsData?.customTranscriptions || [];
  const customPoints = customPointsData || [];

  // Define a type for our points to handle both default and custom points
  type PointType = {
    title: string;
    description: string;
    _id?: Id<'customPoints'>;
    _creationTime?: number;
    userId?: string;
    isDefault?: boolean;
  };

  // Combine default points with custom points, ensuring no duplicates
  const allPoints: PointType[] = [
    ...DEFAULT_POINTS.map(point => ({ ...point, isDefault: true })),
    ...customPoints.filter(cp =>
      !DEFAULT_POINTS.some(dp => dp.title === cp.title)
    )
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Dialog
        isOpen={isDialogOpen}
        close={closeDialog}
        submit={submitDialog}
        title="Add custom instructions"
      />

      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{note.title || 'Untitled'}</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-3xl">
          {/* Summary Section */}
          <div className="mb-8">
            <h4 className="mb-3 font-semibold text-foreground">Summary</h4>
            <div className="rounded-lg bg-muted/50 p-6 text-foreground leading-relaxed">
              {note.summary || 'No summary available'}
            </div>
          </div>

          {/* Transcription Section */}
          <Transcription note={note} target="transcription" onCopy={handleCopy} />

          {/* Custom Transcriptions Section */}
          {customTranscriptions.length > 0 && (
            <div className="mt-8">
              <h4 className="mb-3 font-semibold text-foreground">Generated Content</h4>
              {customTranscriptions.map((customTranscription) =>
                customTranscription.error ? null : customTranscription.loading ? (
                  <div key={customTranscription._id} className="my-6">
                    <InlineLoader text={`Generating ${customTranscription.title}`} className="h-6 w-6 fill-primary text-muted" />
                  </div>
                ) : (
                  <CustomTranscription
                    key={customTranscription._id}
                    note={customTranscription}
                    onCopy={handleCopy}
                    onRendered={handleCustomTranscriptionRendered}
                  />
                )
              )}
            </div>
          )}

          {/* Tweet Section (if available) */}
          {note.tweet && (
            <Transcription note={note} target="tweet" onCopy={handleCopy} />
          )}

          {/* Blog Post Section (if available) */}
          {note.blogPost && (
            <Transcription note={note} target="blogPost" onCopy={handleCopy} />
          )}
        </div>
      </main>

      {/* Sticky Create Button */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        {isMenuOpen && (
          <div className="animate-in slide-in-from-bottom bg-background border-t border-border p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-foreground">Create new content</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {allPoints.map((point, index) => (
                <Button
                  key={point._id ? point._id.toString() : `default-${index}`}
                  variant="outline"
                  className="justify-start h-auto py-3"
                  onClick={() => handleCreateContent(point)}
                  disabled={isCreating}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-primary" />
                  <span>{point.title}</span>
                </Button>
              ))}
              <Button
                variant="outline"
                className="justify-start h-auto py-3 text-primary"
                onClick={openDialog}
                disabled={isCreating}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add custom
              </Button>
            </div>
          </div>
        )}

        <div className="bg-background border-t border-border p-4">
          <Button
            className="w-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            disabled={isCreating}
          >
            {isMenuOpen ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Close
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Content
              </>
            )}
          </Button>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          variant="default"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};
