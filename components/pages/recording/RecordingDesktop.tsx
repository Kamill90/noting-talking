import InlineLoader from '@/components/ui/InlineLoader';
import { Toast } from '@/components/ui/Toast';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { DEFAULT_POINTS } from '@/lib/const';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { sendGAEvent } from '@next/third-parties/google';
import { useMutation } from 'convex/react';
import { ArrowLeft, ChevronUpIcon, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useCustomPoints from '../hooks/useCustomPoints';
import { CustomTranscription } from './subcomponents/CustomTranscription';
import Dialog from './subcomponents/Dialog';
import { Transcription } from './subcomponents/Transcription';
import { AnimatePresence, motion } from 'framer-motion';

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
  const createCustomTranscription = useMutation(api.customTranscriptions.createCustomTranscription);
  const loading = generatingTranscript || generatingTitle;
  const addCustomPoint = useMutation(api.customPoints.createCustomPoint);

  const { addCustomPoints } = useCustomPoints();

  const MAX_INLINE_CUSTOM_POINTS = 3;
  const inlineCustomPoints = customPoints.slice(0, MAX_INLINE_CUSTOM_POINTS);
  const dropdownCustomPoints = customPoints.slice(MAX_INLINE_CUSTOM_POINTS);

  useEffect(() => {
    if (!customPoints.length) {
      addCustomPoint(DEFAULT_POINTS[0]);
      addCustomPoint(DEFAULT_POINTS[1]);
    }
  }, []);

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
    return dropdownCustomPoints.map((point) => (
      <MenuItem key={point._id}>
        {({ active }) => (
          <button
            className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
              } group flex w-full items-center px-4 py-2 text-sm`}
            onClick={() => {
              sendGAEvent('event', 'create_custom_transcription', { point_title: point.title });
              createCustomTranscriptionWithScroll({
                noteId: note._id,
                transcript: transcription,
                point,
              });
            }}
          >
            {point.title}
          </button>
        )}
      </MenuItem>
    ));
  };

  const [showToast, setShowToast] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const handleCopy = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  };

  const toggleFab = () => {
    setFabOpen(!fabOpen);
  };

  const customTranscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const setCustomTranscriptionRef = useCallback((element: HTMLDivElement | null, id: string) => {
    if (element) {
      customTranscriptionRefs.current[id] = element;
    }
  }, []);

  useEffect(() => {
    const loadingTranscription = customTranscriptions.find((t) => t.loading);
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
      const newTranscription = customTranscriptions.find((t) => t.loading);
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
      <Dialog
        isOpen={isDialogOpen}
        close={closeDialog}
        submit={submitDialog}
        title="Add custom instructions"
      />
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:hidden">
        {fabOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setFabOpen(false)}
          />
        )}

        {fabOpen && (
          <div className="mb-4 flex flex-col-reverse gap-3 items-end z-50">
            {inlineCustomPoints.map((point) => (
              <div key={point._id} className="transform translate-x-0 transition-all duration-200 ease-out">
                <button
                  className="flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md"
                  onClick={() => {
                    sendGAEvent('event', 'create_custom_transcription', {
                      point_title: point.title,
                    });
                    createCustomTranscriptionWithScroll({
                      noteId: note._id,
                      transcript: transcription,
                      point,
                    });
                    setFabOpen(false);
                  }}
                >
                  {point.title}
                </button>
              </div>
            ))}

            <div className="transform translate-x-0 transition-all duration-200 ease-out">
              <button
                className="flex items-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-md"
                onClick={() => {
                  openDialog();
                  setFabOpen(false);
                }}
              >
                Add Custom
              </button>
            </div>
          </div>
        )}

        <button
          onClick={toggleFab}
          className={`rounded-full p-3 shadow-lg transition-transform duration-200 z-50 ${fabOpen ? 'bg-zinc-600 rotate-45' : 'bg-zinc-800'
            }`}
        >
          {fabOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </button>
      </div>
      {loading && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
            <svg
              aria-hidden="true"
              className="h-12 w-12 animate-spin fill-zinc-600 text-zinc-200"
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
            <p className="mt-4 font-medium text-zinc-800">Processing your recording...</p>
          </div>
        </div>
      )}
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex-grow">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <header className="py-6">
              <div className="flex items-center justify-between">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors duration-200 ease-in-out hover:bg-zinc-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Back to dashboard
                </Link>
                <h4 className="text-sm font-medium text-zinc-500">
                  {timestampToDate(_creationTime)}
                </h4>
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-zinc-800">
                {title}
              </h1>
            </header>
            <main className="pb-24">
              <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="notebook-page relative p-4 sm:p-8">
                  {/* Right border to mimic notebook page */}
                  <div className="absolute bottom-0 right-0 top-0 w-1 bg-gradient-to-b from-zinc-100 via-zinc-300 to-zinc-100"></div>

                  {/* Page lines for notebook effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="border-b border-zinc-50"
                          style={{
                            height: '2rem',
                            marginTop: i === 0 ? '2.5rem' : '0',
                            opacity: 0.5,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10">
                    {/* Summary section */}
                    <div className="mb-6 border-b border-zinc-200 pb-4 sm:mb-8 sm:pb-6">
                      <div className="flex justify-between pb-2">
                        <h4 className="font-semibold text-zinc-800">Summary</h4>
                      </div>
                      <div className="rounded-md border border-zinc-100 bg-white p-3 text-zinc-800 sm:p-4">
                        {summary}
                      </div>
                    </div>

                    {/* Transcription section */}
                    <Transcription note={note} target="transcription" onCopy={handleCopy} />

                    {/* Generated content sections */}
                    {customTranscriptions.length ? (
                      <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-8">
                        <h3 className="mb-2 inline-flex items-center rounded-md border border-zinc-900 bg-zinc-900 px-2.5 py-0.5 text-sm font-medium text-white">
                          Generated content
                        </h3>
                        {customTranscriptions.map((customTranscription) =>
                          customTranscription.error ? null : customTranscription.loading ? (
                            <div
                              key={customTranscription._id}
                              ref={(el) => setCustomTranscriptionRef(el, customTranscription._id)}
                              className="rounded-md border border-zinc-200 bg-white p-3 sm:p-4"
                            >
                              <InlineLoader text={`Generating ${customTranscription.title}`} />
                            </div>
                          ) : (
                            <div
                              key={customTranscription._id}
                              className="relative rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4"
                            >
                              <div className="absolute bottom-0 left-0 top-0 w-1 bg-zinc-300"></div>
                              <CustomTranscription
                                note={customTranscription}
                                onCopy={handleCopy}
                                onRendered={handleCustomTranscriptionRendered}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        {!loading && (
          <footer className="sticky bottom-0 z-40 border-t border-zinc-200 bg-white shadow-md hidden sm:block">
            <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0">
                <div className="text-sm font-medium text-zinc-700 sm:w-32">Create new</div>
                <div className="flex flex-grow flex-wrap items-center gap-2">
                  {inlineCustomPoints.map((point) => (
                    <button
                      key={point._id}
                      className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
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
                  {dropdownCustomPoints.length > 0 && (
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50">
                          More
                          <ChevronUpIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                        </MenuButton>
                      </div>
                      <MenuItems className="absolute bottom-full left-0 z-10 mb-2 w-56 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-zinc-200 focus:outline-none">
                        <div className="py-1">{renderCustomPoints()}</div>
                      </MenuItems>
                    </Menu>
                  )}
                  <button
                    className="rounded-md border border-zinc-300 bg-zinc-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-700 flex items-center"
                    onClick={openDialog}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1.5 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Custom
                  </button>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
      {showToast && <Toast message="Copied to clipboard" onClose={() => setShowToast(false)} />}
    </>
  );
}
