
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const ToastItem = ({ id, message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));

        // Auto dismiss
        const timer = setTimeout(() => {
            setIsVisible(false); // Trigger exit animation
            setTimeout(() => onClose(id), 300); // Remove after animation
        }, 3000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    // Modern "Premium" Styling (Light Theme Only)
    const baseStyles = "pointer-events-auto flex w-full max-w-sm rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

    // Spring-like entry from right, smooth exit
    const animationStyles = isVisible
        ? "translate-x-0 opacity-100 scale-100"
        : "translate-x-12 opacity-0 scale-95";

    const icons = {
        success: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            </div>
        ),
        error: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
        ),
        info: (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            </div>
        )
    };

    return (
        <div className={`${baseStyles} ${animationStyles} mb-3`} role="alert">
            {icons[type] || icons.info}
            <div className="ml-3 text-sm font-normal">{message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(() => onClose(id), 300);
                }}
            >
                <span className="sr-only">Close</span>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast, success: (msg) => showToast(msg, 'success'), error: (msg) => showToast(msg, 'error') }}>
            {children}
            {createPortal(
                <div className="fixed top-0 right-0 z-100 flex flex-col items-end gap-2 p-4 sm:p-6 pointer-events-none">
                    {toasts.map(toast => (
                        <ToastItem
                            key={toast.id}
                            {...toast}
                            onClose={removeToast}
                        />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
