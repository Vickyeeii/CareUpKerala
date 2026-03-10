import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications';
import { cn } from '../../utils/cn';
import { useToast } from '../../context/ToastContext';
import { Bell, CheckCheck, Clock, Check } from 'lucide-react';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'unread'
    const { success, error: toastError } = useToast();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsApi.getAll();
            setNotifications(data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            toastError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (err) {
            toastError("Failed to update notification");
        }
    };

    const handleMarkAllRead = async () => {
        // Implement bulk mark read if backend supported, for now loop front-end or just implemented specific logic
        // For efficiency, we will skip implementation or do it one by one if requested
        // Let's just do individual for now as backend doesn't support bulk yet
        const unread = notifications.filter(n => !n.is_read);
        for (const n of unread) {
            try {
                await notificationsApi.markAsRead(n.id);
            } catch (e) { console.error(e) }
        }
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        success("All notifications marked as read");
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        return true;
    });

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                                <Bell className="w-8 h-8" />
                            </span>
                            Notifications
                        </h1>
                        <p className="text-gray-500 mt-1 ml-14">Stay updated with your latest activities</p>
                    </div>
                    <div className="flex items-center gap-3 ml-14 sm:ml-0">
                        <button
                            onClick={() => setFilter('all')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                filter === 'all'
                                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all relative",
                                filter === 'unread'
                                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Unread
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-50" />
                            )}
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-2" />
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse h-24" />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-500">You have no {filter === 'unread' ? 'unread' : ''} notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "group relative bg-white rounded-2xl p-6 transition-all duration-300 border hover:shadow-md",
                                    !notification.is_read
                                        ? "border-emerald-100 shadow-sm ring-1 ring-emerald-50"
                                        : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                        !notification.is_read
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-gray-100 text-gray-500"
                                    )}>
                                        <Bell className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className={cn(
                                                    "text-base font-semibold mb-1",
                                                    !notification.is_read ? "text-gray-900" : "text-gray-700"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <p className={cn(
                                                    "text-sm leading-relaxed",
                                                    !notification.is_read ? "text-gray-700" : "text-gray-500"
                                                )}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <span className="flex items-center text-xs font-medium text-gray-400 whitespace-nowrap gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notification.created_at).toLocaleDateString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-50 gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!notification.is_read && (
                                        <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
