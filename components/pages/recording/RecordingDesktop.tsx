import InlineLoader from '@/components/ui/InlineLoader';
import { Toast } from '@/components/ui/Toast';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { sendGAEvent } from '@next/third-parties/google';
import { useMutation } from 'convex/react';
import { ArrowLeft, ChevronDownIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useCustomPoints from '../hooks/useCustomPoints';
import { CustomTranscription } from './subcomponents/CustomTranscription';
import Dialog from './subcomponents/Dialog';
import { Transcription } from './subcomponents/Transcription';

interface Props {
  note: Doc<'notes'>;
  customPoints: {
    _id: Id<'customPoints'>;
    _creationTime: number;
    userId: string;
    title: string;
    description: string;
  }[];
  customTranscriptions: {
    _id: Id<'customTranscriptions'>;
    _creationTime: number;
    noteId: string;
    title: string;
    value: string;
    loading: boolean;
    error: boolean;
  }[];
}

export default function RecordingDesktop({ note, customPoints, customTranscriptions }: Props) {
  const {
    generatingTitle,
    generatingTranscript,
    summary,
    transcription = '',
    title,
    _creationTime,
  } = note;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const mutateTranscription = useMutation(api.notes.modifyNoteByUsage);
  const createCustomTranscription = useMutation(api.customTranscriptions.createCustomTranscription);
  const loading = generatingTranscript || generatingTitle;

  const { addCustomPoints, deleteCustomPoint } = useCustomPoints();

  const inlineCustomPoints = customPoints.slice(0, 4);
  const foldedCustomPoints = customPoints.slice(4, customPoints.length);

  const openDialog = () => {
    sendGAEvent('event', 'open_custom_point_dialog');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    sendGAEvent('event', 'close_custom_point_dialog');
    setIsDialogOpen(false);
  };

  const submitDialog = (title: string, description: string) => {
    if (customPoints.find((point) => point.title === title)) {
      return console.error('duplicates are prohibited');
    }
    sendGAEvent('event', 'create_custom_point', { title });
    addCustomPoints(title, description);
  };

  const renderCustomPoints = () => {
    return foldedCustomPoints.map((point) => (
      <MenuItem key={point._id}>
        <div className="flex flex-row justify-between">
          <button
            onClick={() => {
              sendGAEvent('event', 'create_custom_transcription', { point_title: point.title });
              createCustomTranscription({ noteId: note._id, transcript: transcription, point });
            }}
            className="group flex items-center px-4 py-2 text-sm text-zinc-800 data-[focus]:bg-gray-100 data-[focus]:text-zinc-800 font-montserrat"
          >
            {point.title}
          </button>
          <button
            onClick={() => {
              sendGAEvent('event', 'delete_custom_point', { point_id: point._id });
              deleteCustomPoint(point._id);
            }}
          >
            <TrashIcon
              aria-hidden="true"
              className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
            />
          </button>
        </div>
      </MenuItem>
    ));
  };

  const [showToast, setShowToast] = useState(false);

  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000); // Hide toast after 1 second
  };

  const customTranscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const setCustomTranscriptionRef = useCallback((element: HTMLDivElement | null, id: string) => {
    if (element) {
      customTranscriptionRefs.current[id] = element;
    }
  }, []);

  useEffect(() => {
    const loadingTranscription = customTranscriptions.find(t => t.loading);
    if (loadingTranscription) {
      const ref = customTranscriptionRefs.current[loadingTranscription._id];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [customTranscriptions]);

  const createCustomTranscriptionWithScroll = (params: any) => {
    createCustomTranscription(params);
    setTimeout(() => {
      const newTranscription = customTranscriptions.find(t => t.loading);
      if (newTranscription) {
        const ref = customTranscriptionRefs.current[newTranscription._id];
        if (ref) {
          ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100); // Small delay to ensure the new transcription is added to the DOM
  };

  const handleCustomTranscriptionRendered = useCallback((id: string) => {
    setTimeout(() => {
      const ref = customTranscriptionRefs.current[id];
      if (ref) {
        ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  return (
    <>
      <Dialog isOpen={isDialogOpen} close={closeDialog} submit={submitDialog} />
      {loading && (
        <div className="z-2 absolute h-full w-full bg-slate-300 opacity-70">
          <div
            role="status"
            className="absolute left-1/2 top-2/4 -translate-x-1/2 -translate-y-1/2"
          >
            <svg
              aria-hidden="true"
              className="h-8 w-8 animate-spin fill-red-600 text-gray-200 dark:text-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        </div>
      )}
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <header className="py-4">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md transition-colors duration-200 ease-in-out"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Back to dashboard
                </Link>
                <h4 className="text-sm text-zinc-500">
                  {timestampToDate(_creationTime)}
                </h4>
              </div>
              <h1 className="text-xl font-semibold leading-tight tracking-tight text-zinc-800 mt-2">
                {title}
              </h1>
            </header>
            <main>
              <div className="my-5">
                <div className="flex justify-between">
                  <h4 className="text-zinc-800 font-semibold pb-2">Summary</h4>
                </div>
                <div className="text-zinc-800">{summary}</div>
              </div>
              <Transcription note={note} target="transcription" onCopy={handleCopy} />
              {customTranscriptions.length
                ? customTranscriptions.map((customTranscription) =>
                  customTranscription.error ? null : customTranscription.loading ? (
                    <div
                      key={customTranscription._id}
                      ref={(el) => setCustomTranscriptionRef(el, customTranscription._id)}
                    >
                      <InlineLoader
                        text={`Generating ${customTranscription.title}`}
                      />
                    </div>
                  ) : (
                    <CustomTranscription
                      key={customTranscription._id}
                      note={customTranscription}
                      onCopy={handleCopy}
                      onRendered={handleCustomTranscriptionRendered}
                    />
                  )
                )
                : null}
            </main>
          </div>
        </div>
        {!loading && (
          <footer className="sticky bottom-0 bg-white border-t border-gray-200 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center">
                <div className="text-sm text-gray-500 sm:w-24">Create new</div>
                <div className="flex-grow flex flex-wrap gap-2 items-center">
                  {inlineCustomPoints.map((point) => (
                    <button
                      key={point._id}
                      className="px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md"
                      onClick={() => {
                        sendGAEvent('event', 'create_custom_transcription', {
                          point_title: point.title,
                        });
                        createCustomTranscriptionWithScroll({
                          noteId: note._id,
                          transcript: transcription,
                          point,
                        });
                      }}
                    >
                      {point.title}
                    </button>
                  ))}
                  {foldedCustomPoints.length ? (
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton className="px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md inline-flex items-center">
                          Custom
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="ml-1 h-4 w-4"
                          />
                        </MenuButton>
                      </div>
                      {foldedCustomPoints.length && (
                        <MenuItems
                          className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                          <div className="py-1">{renderCustomPoints()}</div>
                        </MenuItems>
                      )}
                    </Menu>
                  ) : null}
                  <button
                    className="px-3 py-1 text-sm text-sky-600 hover:bg-sky-50 rounded-md"
                    onClick={openDialog}
                  >
                    Add Custom
                  </button>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
      {showToast && (
        <Toast message="Copied to clipboard" onClose={() => setShowToast(false)} />
      )}
    </>
  );
}