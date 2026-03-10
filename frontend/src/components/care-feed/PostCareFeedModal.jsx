import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { careFeedApi } from '../../api/careFeed';
import { useToast } from '../../context/ToastContext';

export function PostCareFeedModal({ isOpen, onClose, bookingId, onSuccess }) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { success, error: toastError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        try {
            await careFeedApi.create({
                booking_id: bookingId,
                message: message.trim()
            });
            success('Update posted successfully');
            setMessage('');
            onClose();
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toastError('Failed to post update');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Post Care Update">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Update Message
                    </label>
                    <textarea
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-3 border"
                        placeholder="Describe the care provided, patient status, or any observations..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !message.trim()}>
                        {loading ? 'Posting...' : 'Post Update'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
