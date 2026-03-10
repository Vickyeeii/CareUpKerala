import axios from './axios';

export const careFeedApi = {
    // Create a new care feed entry (for companions - though primarily used by backend logic, exposing if needed)
    create: async (data) => {
        const response = await axios.post('/care-feed', data);
        return response.data;
    },

    // Get updates for a specific booking (User View)
    getByBooking: async (bookingId) => {
        const response = await axios.get(`/care-feed/${bookingId}`);
        return response.data;
    },

    // Get all care feed updates (Admin View)
    getAll: async () => {
        const response = await axios.get('/care-feed');
        return response.data;
    },

    // Get assigned care feeds (Companion View)
    getAssigned: async () => {
        const response = await axios.get('/care-feed/assigned');
        return response.data;
    },

    // Delete a care feed entry (Admin)
    delete: async (id) => {
        await axios.delete(`/care-feed/${id}`);
    }
};
