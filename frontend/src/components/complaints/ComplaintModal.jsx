import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { complaintsApi } from '../../api/complaints';
import { useToast } from '../../context/ToastContext';
import { AlertCircle } from 'lucide-react';

export function ComplaintModal({ isOpen, onClose, booking }) {
    const { success, error: toastError } = useToast();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({ title: '', description: '' });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!booking) return;

        setSubmitting(true);
        try {
            const payload = {
                booking_id: booking.id,
                title: formData.title,
                description: formData.description
            };

            await complaintsApi.create(payload);
            success('Complaint submitted successfully. Our team will review it shortly.');
            onClose();
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || 'Failed to submit complaint');
        } finally {
            setSubmitting(false);
        }
    };

    if (!booking) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Report an Issue">
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                    <p className="font-medium">Reporting issue for: {booking.service_name}</p>
                    <p className="mt-1">Please describe your issue in detail so we can help you better.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Issue Title
                    </label>
                    <Input
                        required
                        type="text"
                        placeholder="e.g., Companion arrived late"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Provide details about what happened..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {submitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
