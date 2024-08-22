'use client';
import usePlayer from '@/components/pages/hooks/usePlayer';
import InlineLoader from '@/components/ui/InlineLoader';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { sendGAEvent } from '@next/third-parties/google';
import { Preloaded, useMutation } from 'convex/react';
import debounce from 'lodash/debounce';
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useContext, useState } from 'react';
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

  const { playerState, play, pause, stop, resume } = usePlayer();

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }

  const actions = [
    {
      title: 'Delete',
      onClick: (id: Id<'notes'>) => {
        sendGAEvent('event', 'remove_note', { note_id: id });
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
                    sendGAEvent('event', 'play_audio', { note_id: note._id });
                    play(note.audioFileUrl);
                  }}
                />
              )}
            </div>

            {note.generatingTitle || note.generatingTranscript ? (
              <div className="flex basis-1/2 items-center">
                <p className="font-montserrat text-sm font-semibold leading-6 text-zinc-800">
                  Progressing...
                </p>
                <InlineLoader text="" />
              </div>
            ) : (
              <Link href={`/recording/${note._id}`} className="flex min-w-0 basis-1/2 gap-x-4">
                <div className="min-w-0 flex-auto self-center">
                  <p className="font-montserrat text-sm font-semibold leading-6 text-zinc-800">
                    {note.title}
                  </p>
                </div>
              </Link>
            )}
            {note._creationTime && (
              <div className="flex-end min-w-0 self-center">
                <p className="mx-50 text-sm leading-6 text-zinc-800">
                  {timestampToDate(note._creationTime)}
                </p>
              </div>
            )}
            <Menu as="div" className="flex-end relative inline-block self-center text-left">
              <div>
                <MenuButton className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-600 focus:outline-none">
                  <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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

  const debouncedSendGAEvent = useCallback(
    debounce((value: string) => {
      sendGAEvent('event', 'search', value);
    }, 300),
    [],
  );

  return (
    <>
      <div className="min-h-full">
        <div className="py-10">
          <main>
            <div className="mx-auto flex w-full max-w-7xl flex-row justify-between px-4 sm:px-6">
              <div className="relative flex h-12 items-center self-center">
                <input
                  placeholder="Search for a voice note"
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setSearchQuery(newValue);
                    debouncedSendGAEvent(newValue);
                  }}
                  className="block h-full w-full rounded-full border-0 py-1.5 pr-14 font-montserrat font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-zinc-400 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-zinc-800 sm:text-sm sm:leading-6"
                />
              </div>
              <button
                disabled={isRecording}
                type="button"
                className={classNames(
                  isRecording ? 'bg-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700',
                  'text-md rounded-full px-3.5 py-2.5 font-montserrat font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
                )}
                onClick={() => {
                  sendGAEvent('event', 'start_recording');
                  startRecording();
                }}
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
