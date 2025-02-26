'use client';
import usePlayer from '@/components/pages/hooks/usePlayer';
import InlineLoader from '@/components/ui/InlineLoader';
import { Button } from '@/components/ui/shadcn/button';
import { Input } from '@/components/ui/shadcn/input';
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
import Image from 'next/image';
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
              focus ? 'bg-accent text-accent-foreground' : 'text-foreground',
              'block px-4 py-2 text-sm rounded-sm',
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
          <li key={note._id} className="flex flex-row justify-between gap-x-6 border border-border rounded-md px-8 py-5 bg-card text-card-foreground">
            <div className="flex w-14 flex-row items-center justify-start">
              {playerState.currentUrl === note.audioFileUrl ? (
                <>
                  {playerState.isPaused ? (
                    <PlayIcon
                      type="button"
                      className="mr-2 w-5 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                      onClick={resume}
                    />
                  ) : (
                    <PauseIcon
                      type="button"
                      className="mr-2 w-5 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                      onClick={pause}
                    />
                  )}

                  <SquareIcon
                    className="mr-2 w-5 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                    onClick={stop}
                  />
                </>
              ) : (
                <PlayIcon
                  type="button"
                  className="mr-2 w-5 cursor-pointer text-primary hover:text-primary/80 transition-colors"
                  onClick={() => {
                    sendGAEvent('event', 'play_audio', { note_id: note._id });
                    play(note.audioFileUrl);
                  }}
                />
              )}
            </div>

            {note.generatingTitle || note.generatingTranscript ? (
              <div className="flex basis-1/2 items-center">
                <p className="text-sm font-semibold leading-6 text-foreground">
                  Progressing...
                </p>
                <InlineLoader text="" />
              </div>
            ) : (
              <Link href={`/recording/${note._id}`} className="flex min-w-0 basis-1/2 gap-x-4">
                <div className="min-w-0 flex-auto self-center">
                  <p className="text-sm font-semibold leading-6 text-foreground">
                    {note.title}
                  </p>
                </div>
              </Link>
            )}
            {note._creationTime && (
              <div className="flex-end min-w-0 self-center">
                <p className="mx-50 text-sm leading-6 text-muted-foreground">
                  {timestampToDate(note._creationTime)}
                </p>
              </div>
            )}
            <Menu as="div" className="flex-end relative inline-block self-center text-left">
              <div>
                <MenuButton className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
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
                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-popover border border-border shadow-md focus:outline-none">
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
                {allNotes.length > 0 && (
                  <Input
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
                    className="h-12 w-full rounded-full pr-14 font-medium"
                  />
                )}
              </div>
              {allNotes.length > 0 && (
                <Button
                  disabled={isRecording}
                  onClick={() => {
                    sendGAEvent('event', 'start_recording');
                    startRecording();
                  }}
                  variant="default"
                  className="h-12 rounded-full px-6"
                >
                  Record note
                </Button>
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
                  <h2 className="text-3xl font-semibold text-foreground">
                    Record your first note
                  </h2>
                  <p className="max-w-md pb-2 text-center text-muted-foreground">
                    Create content based on voice messages or record meetings and get summaries.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      className="rounded-lg px-4 py-2.5"
                    >
                      Record meeting
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="mx-auto mt-8 max-w-7xl px-4 text-right sm:px-6">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSehsyR2hUwSqQyabfiJNpXdsomGglBbyNwQGmEtEdelotBsVg/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Leave feedback
              </a>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
