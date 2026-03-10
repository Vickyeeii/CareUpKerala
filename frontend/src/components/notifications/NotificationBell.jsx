import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { cn } from '../../utils/cn';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const { error: toastError } = useToast();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const data = await notificationsApi.getAll();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation(); // Prevent closing dropdown if we want to keep it open
        try {
            await notificationsApi.markAsRead(id);
            // Update local state
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            toastError("Failed to update notification");
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id, { stopPropagation: () => { } });
        }
        // Navigate or take action based on related_entity if needed in future
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all origin-top-right">
                    <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            {unreadCount} unread
                        </span>
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.slice(0, 5).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={cn(
                                            "group p-4 hover:bg-emerald-50/60 transition-all duration-200 cursor-pointer flex gap-3",
                                            !notification.is_read ? "bg-emerald-50/40" : "bg-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-sm transition-colors",
                                            !notification.is_read ? "bg-emerald-500 ring-2 ring-emerald-100" : "bg-transparent"
                                        )} />

                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={cn("text-sm font-semibold tracking-tight", !notification.is_read ? "text-emerald-950" : "text-gray-700")}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium">
                                                    {new Date(notification.created_at).toLocaleDateString(undefined, {
                                                        month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <p className={cn("text-xs leading-relaxed line-clamp-2", !notification.is_read ? "text-emerald-800/80" : "text-gray-500")}>
                                                {notification.message}
                                            </p>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                    className="mt-2 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Check className="w-3 h-3" /> Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 text-center border-t border-gray-100 bg-gray-50">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/dashboard/notifications');
                            }}
                            className="p-3 text-xs font-semibold text-gray-600 hover:text-emerald-600 hover:bg-white transition-colors border-r border-gray-100"
                        >
                            View all
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-3 text-xs font-semibold text-gray-600 hover:text-red-500 hover:bg-white transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
