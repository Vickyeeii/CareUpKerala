import axios from './axios';

export const bookingsApi = {
    // Create a booking (User)
    create: async (data) => {
        const response = await axios.post('/bookings', data);
        return response.data;
    },

    // Get my bookings (User)
    getMyBookings: async (page = 1, limit = 10) => {
        const response = await axios.get('/bookings/me', {
            params: { page, limit }
        });
        return response.data;
    },

    // Get all bookings (Admin)
    getAll: async (page = 1, limit = 10) => {
        const response = await axios.get('/bookings', {
            params: { page, limit }
        });
        return response.data;
    },

    // Update booking status (Admin)
    updateStatus: async (id, status) => {
        const response = await axios.put(`/bookings/${id}/status`, { status });
        return response.data;
    },

    // Assign companion (Admin)
    assignCompanion: async (id, companionId) => {
        const response = await axios.put(`/bookings/${id}/assign-companion`, { companion_id: companionId });
        return response.data;
    }
};
