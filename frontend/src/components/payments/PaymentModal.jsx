import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { paymentsApi } from '../../api/payments';
import { useToast } from '../../context/ToastContext';

export function PaymentModal({ isOpen, onClose, booking, onPaymentSuccess }) {
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    if (!booking) return null;

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await paymentsApi.create({
                booking_id: booking.id,
                payment_method: paymentMethod
            });
            success('Payment initiated successfully! Status: Pending');
            if (onPaymentSuccess) onPaymentSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toastError(err.response?.data?.detail || 'Failed to initiate payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
            <form onSubmit={handlePayment} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Service:</span>
                        <span className="font-semibold text-gray-900">{booking.service_name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Hospital:</span>
                        <span className="font-medium text-gray-900">{booking.hospital_name}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-700">Total Amount:</span>
                        <span className="font-bold text-2xl text-accent">
                            {booking.currency} {booking.price}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {['card', 'upi', 'netbanking', 'cash'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`
                                    py-3 px-4 rounded-xl text-sm font-medium border-2 transition-all
                                    ${paymentMethod === method
                                        ? 'border-accent bg-accent/5 text-accent shadow-sm'
                                        : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span className="capitalize">{method === 'netbanking' ? 'Net Banking' : method.toUpperCase()}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="px-8">
                        {loading ? 'Processing...' : 'Pay Now'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
