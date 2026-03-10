import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { careFeedApi } from '../../api/careFeed';
import { useToast } from '../../context/ToastContext';
import { Activity, Clock, User } from 'lucide-react';

export function CareFeedModal({ isOpen, onClose, booking }) {
    const { error: toastError } = useToast();
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && booking) {
            loadFeeds();
        }
    }, [isOpen, booking]);

    const loadFeeds = async () => {
        setLoading(true);
        try {
            const data = await careFeedApi.getByBooking(booking.id);
            // Sort by date descending (newest first)
            const sorted = (data || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setFeeds(sorted);
        } catch (err) {
            console.error(err);
            toastError('Failed to load care updates');
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Care Updates Timeline">
            <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center text-sm">
                    <div>
                        <span className="text-gray-500 block">Service</span>
                        <span className="font-semibold text-gray-900">{booking.service_name}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 block">Date</span>
                        <span className="font-medium text-gray-900">
                            {new Date(booking.scheduled_date).toLocaleDateString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <div className="mt-6 relative">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    ) : feeds.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                            <p>No updates posted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

                            {feeds.map((feed) => (
                                <div key={feed.id} className="relative pl-12">
                                    {/* Dot */}
                                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-accent border-4 border-white shadow-sm transform -translate-x-1/2"></div>

                                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <p className="text-gray-800 whitespace-pre-wrap">{feed.message}</p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{new Date(feed.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                                            </div>
                                            {feed.companion_id && (
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    <span>By Companion</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
