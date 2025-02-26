'use client';

import { DialogBackdrop, DialogPanel, Dialog as ReactDialog } from '@headlessui/react';
import { sendGAEvent } from '@next/third-parties/google';
import { useEffect, useRef } from 'react';

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
    <ReactDialog open={isOpen} onClose={close}>
      <DialogBackdrop className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <DialogPanel className="fixed inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md transform overflow-hidden rounded-lg border border-border bg-card p-6 text-left align-middle shadow-xl transition-all">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {title}
          </h2>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-foreground">
                Name
              </label>
              <div className="mt-2">
                <input
                  ref={titleInputRef}
                  id="title"
                  name="title"
                  required
                  className="block w-full rounded-md border border-input bg-background py-1.5 text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-foreground"
              >
                Describe what type of content would you like to get
              </label>
              <div className="mt-2">
                <input
                  ref={descriptionInputRef}
                  id="description"
                  name="What type of content would you like to create?"
                  required
                  className="block w-full rounded-md border border-input bg-background py-1.5 text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-ring sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <button
                type="button"
                onClick={close}
                className="flex w-full justify-center rounded-md border border-input px-3 py-1.5 text-sm font-semibold leading-6 text-foreground shadow-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
