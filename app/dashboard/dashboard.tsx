'use client';
import usePlayer from '@/components/pages/hooks/usePlayer';
import InlineLoader from '@/components/ui/InlineLoader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { DEFAULT_POINTS } from '@/lib/const';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Preloaded, useMutation } from 'convex/react';
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { RecordingContext } from '../RecordingContext';

export default function DashboardHomePage({
  preloadedNotes,
  preloadedCustomPoints,
}: {
  preloadedNotes: Preloaded<typeof api.notes.getNotes>;
  preloadedCustomPoints: Preloaded<typeof api.customPoints.getCustomPoints>;
}) {
  const allNotes = usePreloadedQueryWithAuth(preloadedNotes);
  const allCustomPoints = usePreloadedQueryWithAuth(preloadedCustomPoints);

  const { isRecording, startRecording } = useContext(RecordingContext);

  const [searchQuery, setSearchQuery] = useState('');
  const mutateNoteRemove = useMutation(api.notes.removeNote);
  const addCustomPoint = useMutation(api.customPoints.createCustomPoint);

  const { playerState, play, pause, stop, resume } = usePlayer();

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  useEffect(() => {
    if (!allCustomPoints.length) {
      addCustomPoint(DEFAULT_POINTS[0]);
      addCustomPoint(DEFAULT_POINTS[1]);
    }
  }, []);

  const actions = [
    {
      title: 'remove',
      onClick: (id: Id<'notes'>) => {
        mutateNoteRemove({ id });
      },
    },
  ];

  const actionItems = ({
    item,
    note,
  }: {
    item: { title: string; onClick: (id: Id<'notes'>) => void };
    note: { _id: any };
  }) => {
    return (
      <MenuItem key={note._id}>
        {({ focus }) => (
          <a
            href="#"
            className={classNames(
              focus ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
              'block px-4 py-2 text-sm',
            )}
            onClick={() => {
              item.onClick(note._id);
            }}
          >
            {item.title}
          </a>
        )}
      </MenuItem>
    );
  };

  const renderList = () => {
    const filteredNotes = allNotes.filter((note) => {
      return searchQuery ? note.title?.toLowerCase().match(searchQuery.toLowerCase()) : true;
    });

    return filteredNotes
      .sort((a, b) => b._creationTime - a._creationTime)
      .map((note) => {
        return (
          <li key={note._id} className="flex flex-row justify-between gap-x-6 border px-8 py-5">
            <div className="flex w-14 flex-row items-center justify-start">
              {playerState.currentUrl === note.audioFileUrl ? (
                <>
                  {playerState.isPaused ? (
                    <PlayIcon
                      type="button"
                      className="mr-2 w-5 cursor-pointer opacity-100 transition-all duration-1000 ease-in-out hover:opacity-75"
                      onClick={resume}
                    />
                  ) : (
                    <PauseIcon
                      type="button"
                      className="mr-2 w-5 cursor-pointer opacity-100 transition-all duration-1000 ease-in-out hover:opacity-75"
                      onClick={pause}
                    />
                  )}

                  <SquareIcon
                    className="mr-2 w-5 cursor-pointer opacity-100 transition-all duration-1000 ease-in-out hover:opacity-75"
                    onClick={stop}
                  />
                </>
              ) : (
                <PlayIcon
                  type="button"
                  className="mr-2 w-5 cursor-pointer opacity-100 transition-all duration-1000 ease-in-out hover:opacity-75"
                  onClick={() => {
                    play(note.audioFileUrl);
                  }}
                />
              )}
            </div>

            {note.generatingTitle || note.generatingTranscript ? (
              <div className="flex basis-1/2 items-center">
                <p className="text-sm font-semibold leading-6 text-gray-900">Progressing...</p>
                <InlineLoader />
              </div>
            ) : (
              <Link href={`/recording/${note._id}`} className="flex min-w-0 basis-1/2 gap-x-4">
                <div className="min-w-0 flex-auto self-center">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{note.title}</p>
                </div>
              </Link>
            )}
            {note._creationTime && (
              <div className="flex-end min-w-0 self-center">
                <p className="mx-50 text-sm font-semibold leading-6 text-gray-900">
                  {timestampToDate(note._creationTime)}
                </p>
              </div>
            )}
            <Menu as="div" className="flex-end relative inline-block self-center text-left">
              <div>
                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  Options
                </MenuButton>
              </div>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">{actions.map((item) => actionItems({ item, note }))}</div>
                </MenuItems>
              </Transition>
            </Menu>
          </li>
        );
      });
  };
  return (
    <>
      <div className="min-h-full">
        <div className="py-10">
          <main>
            <div className="mx-auto flex w-full max-w-7xl flex-row justify-between px-4 sm:px-6">
              <h1 className="mb-5 text-base font-semibold leading-7 text-gray-900">
                Your voice notes
              </h1>
            </div>
            <div className="mx-auto flex w-full max-w-7xl flex-row justify-between px-4 sm:px-6">
              <div className="relative flex h-12 items-center self-center">
                <input
                  placeholder="Search"
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="block h-full w-full rounded-md border-0 py-1.5 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <button
                disabled={isRecording}
                type="button"
                className={classNames(
                  isRecording ? 'bg-indigo-100' : 'bg-indigo-600 hover:bg-indigo-500',
                  '"flex-end focus-visible:outline-indigo-600" rounded-md px-3.5 py-2.5 text-xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                )}
                onClick={startRecording}
              >
                Record note
              </button>
            </div>
            <div className="mx-auto my-8 max-w-7xl sm:px-6">
              <ul role="list">{allNotes.length ? renderList() : <h2>no recordings</h2>}</ul>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
