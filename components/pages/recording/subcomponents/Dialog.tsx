'use client';

import { DialogBackdrop, DialogPanel, Dialog as ReactDialog } from '@headlessui/react';
import { sendGAEvent } from '@next/third-parties/google';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  close: () => void;
  submit: (title: string, description: string) => void;
  title: string;
  initialTitle?: string;
  initialDescription?: string;
}

export default function Dialog({
  isOpen,
  close,
  submit,
  title,
  initialTitle = '',
  initialDescription = '',
}: Props) {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && titleInputRef.current && descriptionInputRef.current) {
      titleInputRef.current.value = initialTitle;
      descriptionInputRef.current.value = initialDescription;
    }
  }, [isOpen, initialTitle, initialDescription]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInputRef.current && descriptionInputRef.current) {
      sendGAEvent('event', 'submit_custom_point', { title: titleInputRef.current.value });
      submit(titleInputRef.current.value, descriptionInputRef.current.value);
    }
    close();
  };

  return (
    <ReactDialog open={isOpen} onClose={close} className="relative z-[9999]">
      <DialogBackdrop
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <DialogPanel className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="w-full max-w-md transform overflow-hidden rounded-xl border border-zinc-100 bg-white p-6 text-left shadow-2xl transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-montserrat text-xl font-bold leading-tight text-zinc-800">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block font-montserrat text-sm font-medium leading-6 text-zinc-700"
              >
                Name
              </label>
              <div className="mt-1.5">
                <input
                  ref={titleInputRef}
                  id="title"
                  name="title"
                  placeholder="Enter a name for your custom content"
                  required
                  className="block w-full rounded-md border-0 px-3 py-2 text-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-800 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block font-montserrat text-sm font-medium leading-6 text-zinc-700"
              >
                What type of content would you like to create?
              </label>
              <div className="mt-1.5">
                <input
                  ref={descriptionInputRef}
                  id="description"
                  name="description"
                  placeholder="E.g., summary, key points, action items"
                  required
                  className="block w-full rounded-md border-0 px-3 py-2 text-zinc-800 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-800 sm:text-sm"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">
                Describe what you want to generate from your recording.
              </p>
            </div>

            <div className="flex flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="flex w-full justify-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
              >
                Add custom content
              </button>
            </div>
          </form>
        </div>
      </DialogPanel>
    </ReactDialog>
  );
}
