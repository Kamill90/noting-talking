'use client';

import { DialogBackdrop, DialogPanel, Dialog as ReactDialog } from '@headlessui/react';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  close: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDialog({ isOpen, close, onConfirm, title, message }: Props) {
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

          <div className="mb-6 mt-2">
            <p className="text-sm text-zinc-700">{message}</p>
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
              type="button"
              onClick={() => {
                onConfirm();
                close();
              }}
              className="flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </DialogPanel>
    </ReactDialog>
  );
}
