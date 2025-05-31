'use client';
import usePlayer from '@/components/pages/hooks/usePlayer';
import InlineLoader from '@/components/ui/InlineLoader';
import { LanguagePicker } from '@/components/ui/LanguagePicker';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { timestampToDate } from '@/convex/utils';
import { usePreloadedQueryWithAuth } from '@/lib/hooks';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { sendGAEvent } from '@next/third-parties/google';
import { Preloaded, useMutation } from 'convex/react';
import debounce from 'lodash/debounce';
import { PauseIcon, PlayIcon, SquareIcon } from 'lucide-react';
import Image from 'next/image';
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
  const { isRecording, startRecording } = useContext(RecordingContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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
                <MenuItems className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
      <div className="min-h-full pb-20 sm:pb-0">
        <div className="py-10">
          <main>
            <div className="mx-auto flex w-full max-w-7xl flex-row justify-between px-4 sm:px-6">
              <div className="relative flex h-12 items-center self-center w-full sm:w-auto">
                {allNotes.length > 0 && (
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
                )}
              </div>
              {allNotes.length > 0 && (
                <div className="hidden sm:flex items-center space-x-3">
                  <LanguagePicker
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    compact={true}
                  />
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <MenuButton
                        disabled={isRecording}
                        className={classNames(
                          isRecording ? 'bg-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700',
                          'text-md inline-flex items-center rounded-lg px-6 py-2.5 font-montserrat font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
                        )}
                      >
                        Record new
                        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
                        <div className="py-1">
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block w-full px-4 py-2 text-left text-sm',
                                )}
                                onClick={() => {
                                  sendGAEvent('event', 'start_recording');
                                  startRecording(false);
                                }}
                              >
                                Note
                              </button>
                            )}
                          </MenuItem>
                          <MenuItem>
                            {({ active }) => (
                              <button
                                className={classNames(
                                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                  'block w-full px-4 py-2 text-left text-sm',
                                )}
                                onClick={() => {
                                  sendGAEvent('event', 'start_recording');
                                  startRecording(true);
                                }}
                              >
                                Meeting
                              </button>
                            )}
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>
                </div>
              )}
            </div>
            <div className="mx-auto my-8 max-w-7xl sm:px-6">
              {allNotes.length ? (
                <ul role="list">{renderList()}</ul>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                  <div className="relative h-64 w-64">
                    <Image
                      src="/images/empty-state.svg"
                      alt="Empty state illustration"
                      layout="fill"
                      objectFit="contain"
                      priority
                    />
                  </div>
                  <h2 className="font-montserrat text-3xl font-semibold text-zinc-800">
                    Record your first note
                  </h2>
                  <p className="max-w-md pb-2 text-center text-zinc-600">
                    Create content based on voice messages or record meetings and get summaries.
                  </p>
                  <div className="hidden sm:flex items-center space-x-3">
                    <LanguagePicker
                      selectedLanguage={selectedLanguage}
                      onLanguageChange={setSelectedLanguage}
                      compact={true}
                    />
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <MenuButton
                          disabled={isRecording}
                          className={classNames(
                            isRecording ? 'bg-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700',
                            'text-md inline-flex items-center rounded-lg px-6 py-2.5 font-montserrat font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
                          )}
                        >
                          Record new
                          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
                          <div className="py-1">
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'block w-full px-4 py-2 text-left text-sm',
                                  )}
                                  onClick={() => {
                                    sendGAEvent('event', 'start_recording');
                                    startRecording(false);
                                  }}
                                >
                                  Note
                                </button>
                              )}
                            </MenuItem>
                            <MenuItem>
                              {({ active }) => (
                                <button
                                  className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    'block w-full px-4 py-2 text-left text-sm',
                                  )}
                                  onClick={() => {
                                    sendGAEvent('event', 'start_recording');
                                    startRecording(true);
                                  }}
                                >
                                  Meeting
                                </button>
                              )}
                            </MenuItem>
                          </div>
                        </MenuItems>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              )}
            </div>
          </main>
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="pb-8">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSehsyR2hUwSqQyabfiJNpXdsomGglBbyNwQGmEtEdelotBsVg/viewform?usp=dialog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
                onClick={() => sendGAEvent('event', 'open_feedback_form')}
              >
                Leave feedback
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile floating controls */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 px-4 py-3 sm:hidden">
          <div className="flex items-center space-x-3">
            <LanguagePicker
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              compact={true}
              mobileBottomBar={true}
            />
            <Menu as="div" className="relative flex-1">
              <div>
                <MenuButton
                  disabled={isRecording}
                  className={classNames(
                    isRecording ? 'bg-zinc-300' : 'bg-zinc-800 hover:bg-zinc-700',
                    'w-full inline-flex items-center justify-center rounded-lg px-6 py-3 font-montserrat font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-600',
                  )}
                >
                  Record new
                  <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
                <MenuItems className="absolute bottom-full mb-2 left-0 right-0 z-10 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <MenuItem>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block w-full px-4 py-2 text-left text-sm',
                          )}
                          onClick={() => {
                            sendGAEvent('event', 'start_recording');
                            startRecording(false);
                          }}
                        >
                          Note
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block w-full px-4 py-2 text-left text-sm',
                          )}
                          onClick={() => {
                            sendGAEvent('event', 'start_recording');
                            startRecording(true);
                          }}
                        >
                          Meeting
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
}
