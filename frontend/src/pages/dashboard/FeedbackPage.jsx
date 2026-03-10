import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../api/feedback';
import { Card, CardContent } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { Star, Search, Filter } from 'lucide-react';

const FeedbackPage = () => {
    const { error: toastError } = useToast();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('all'); // all, 5, 4, 3, 2, 1
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadFeedback();
    }, []);

    const loadFeedback = async () => {
        try {
            setLoading(true);
            const data = await feedbackApi.getAll();
            setFeedbacks(data || []);
        } catch (err) {
            console.error(err);
            toastError("Failed to load feedback");
        } finally {
            setLoading(false);
        }
    };

    const filteredFeedback = feedbacks.filter(f => {
        const matchesRating = filterRating === 'all' || f.rating === parseInt(filterRating);
        const matchesSearch = (f.comment && f.comment.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesRating && matchesSearch;
    });

    // Helper to render stars
    const renderStars = (rating) => {
        return (
            <div className="flex space-x-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading reviews...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Reviews</h1>
                    <p className="text-gray-500">Monitor user satisfaction and feedback</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search comments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredFeedback.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            No reviews found matching your filters.
                        </CardContent>
                    </Card>
                ) : (
                    filteredFeedback.map((feedback) => (
                        <Card key={feedback.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {renderStars(feedback.rating)}
                                            <span className="text-sm font-bold text-gray-900 ml-1">
                                                {feedback.rating}.0
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(feedback.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {feedback.comment ? (
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            "{feedback.comment}"
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-sm italic">
                                            No written comment provided.
                                        </p>
                                    )}

                                    {/* Enhanced Context Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs mt-2">
                                        <div>
                                            <span className="block text-gray-400 uppercase font-semibold text-[10px]">Service</span>
                                            <span className="font-medium text-gray-700">{feedback.service_name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 uppercase font-semibold text-[10px]">Companion</span>
                                            <span className="font-medium text-gray-700">{feedback.companion_name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 uppercase font-semibold text-[10px]">Reviewed By</span>
                                            <span className="font-medium text-gray-700">{feedback.nri_name}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-4 text-xs text-gray-500">
                                        <span>Booking ID: <span className="font-mono">{feedback.booking_id.slice(0, 8)}</span></span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;
