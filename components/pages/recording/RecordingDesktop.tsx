import InlineLoader from '@/components/ui/InlineLoader';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useMutation } from 'convex/react';
import { ChevronDownIcon, ChevronLeft, TrashIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const submitDialog = (title: string, description: string) => {
    if (customPoints.find((point) => point.title === title)) {
      return console.error('duplicates are prohibited');
    }
    addCustomPoints(title, description);
  };

  const renderCustomPoints = () => {
    return foldedCustomPoints.map((point) => (
      <MenuItem key={point._id}>
        <div className="flex flex-row justify-between">
          <button
            onClick={() => {
              createCustomTranscription({ noteId: note._id, transcript: transcription, point });
            }}
            className="group flex items-center px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900"
          >
            {point.title}
          </button>
          <button
            onClick={() => {
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
      <div className="min-h-screen">
        <div className="py-10">
          <header>
            <Link
              href="/dashboard"
              className="text-m mx-auto block flex max-w-7xl py-2 font-semibold text-blue-400 hover:bg-gray-50"
            >
              <ChevronLeft className="shrink-0 text-blue-400" aria-hidden="true" />
              Dashboard
            </Link>
            <div className="mx-auto flex max-w-7xl justify-between px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                {title}
              </h1>
              <h4 className="text-l font-bold leading-tight tracking-tight text-gray-400">
                {timestampToDate(_creationTime)}
              </h4>
            </div>
          </header>
          <main>
            <div className="my-10">
              <div className="mx-auto flex max-w-7xl justify-between sm:px-6 lg:px-8">
                <h4 className="text-l text-gray-400">Summary</h4>
              </div>
              <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{summary}</div>
            </div>
            <Transcription note={note} target="transcription" />
            {customTranscriptions.length
              ? customTranscriptions.map((customTranscription) =>
                  customTranscription.error ? null : customTranscription.loading ? (
                    <InlineLoader
                      key={customTranscription._id}
                      text={`Generating ${customTranscription.title}`}
                    />
                  ) : (
                    <CustomTranscription key={customTranscription._id} note={customTranscription} />
                  ),
                )
              : null}
          </main>
        </div>
        {!loading && (
          <footer className="z-1 sticky bottom-0 bg-white">
            <div className="mx-auto min-h-full max-w-7xl py-10">
              <div className="text-gray-400">Create</div>
              <div className="flex flex-row justify-between">
                <div>
                  {inlineCustomPoints.map((point) => (
                    <button
                      key={point._id}
                      className="mr-5 text-blue-400"
                      onClick={() => {
                        createCustomTranscription({
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
                        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 bg-white px-3 py-2 text-sm font-semibold text-blue-400">
                          Custom
                          <ChevronDownIcon
                            aria-hidden="true"
                            className="-mr-1 h-5 w-5 text-gray-400"
                          />
                        </MenuButton>
                      </div>
                      {foldedCustomPoints.length && (
                        <MenuItems
                          transition
                          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                        >
                          <div className="py-1">{renderCustomPoints()}</div>
                        </MenuItems>
                      )}
                    </Menu>
                  ) : null}
                </div>
                <button className="mr-5 text-blue-400" onClick={openDialog}>
                  Add Custom
                </button>
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
