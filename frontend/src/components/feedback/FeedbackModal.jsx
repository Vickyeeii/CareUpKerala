import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { feedbackApi } from '../../api/feedback';
import { useToast } from '../../context/ToastContext';
import { Star } from 'lucide-react';

export function FeedbackModal({ isOpen, onClose, booking }) {
    const { success, error: toastError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setRating(0);
            setComment('');
            setHoveredRating(0);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!booking) return;
        if (rating === 0) {
            toastError("Please select a star rating");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                booking_id: booking.id,
                rating: rating,
                comment: comment
            };

            await feedbackApi.submit(payload);
            success('Review submitted successfully! Thank you for your feedback.');
            onClose();
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Experience">
            <div className="mb-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    How was the service?
                </h3>
                <p className="text-sm text-gray-500">
                    {booking.service_name} on {new Date(booking.scheduled_date).toLocaleDateString()}
                </p>
                {booking.companion_name && (
                    <p className="text-sm text-gray-500 mt-1">
                        Companion: {booking.companion_name}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoveredRating || rating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>

                <div className="text-center text-sm font-medium text-yellow-600 h-5">
                    {hoveredRating === 1 && "Poor"}
                    {hoveredRating === 2 && "Fair"}
                    {hoveredRating === 3 && "Good"}
                    {hoveredRating === 4 && "Very Good"}
                    {hoveredRating === 5 && "Excellent!"}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Comments (Optional)
                    </label>
                    <textarea
                        rows={4}
                        placeholder="Share your experience about the companion and service..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    />
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="bg-primary hover:bg-primary/90 text-white"
                    >
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
