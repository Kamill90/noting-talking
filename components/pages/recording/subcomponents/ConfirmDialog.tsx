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

export default function ConfirmDialog({
    isOpen,
    close,
    onConfirm,
    title,
    message,
}: Props) {
    return (
        <ReactDialog open={isOpen} onClose={close} className="relative z-[9999]">
            <DialogBackdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" aria-hidden="true" />
            <DialogPanel className="fixed inset-0 flex items-center justify-center p-4 z-[10000]">
                <div className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-2xl transition-all border border-zinc-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold leading-tight text-zinc-800 font-montserrat">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mt-2 mb-6">
                        <p className="text-sm text-zinc-700">{message}</p>
                    </div>

                    <div className="flex flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={close}
                            className="flex w-full justify-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                close();
                            }}
                            className="flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </DialogPanel>
        </ReactDialog>
    );
} 