import axios from './axios';

export const paymentsApi = {
    // Create a payment (User)
    create: async (data) => {
        const response = await axios.post('/payments', data);
        return response.data;
    },

    // Get my payments (User)
    getMyPayments: async () => {
        const response = await axios.get('/payments/me');
        return response.data;
    },

    // Get all payments (Admin)
    getAll: async () => {
        const response = await axios.get('/payments');
        return response.data;
    },

    // Update payment status (Admin)
    updateStatus: async (id, status) => {
        const response = await axios.put(`/payments/${id}/status`, { status });
        return response.data;
    }
};
