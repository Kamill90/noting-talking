import { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, duration = 1000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="text-sm fixed bottom-4 right-4 bg-zinc-800 text-white px-4 py-2 rounded-md shadow-lg font-montserrat">
            {message}
        </div>
    );
};