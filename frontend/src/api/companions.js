import axios from './axios';

export const companionsApi = {
    getMyProfile: async () => {
        const response = await axios.get('/companions/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await axios.put('/companions/me', data);
        return response.data;
    },

    updateAvailability: async (status) => {
        // status: "available" | "unavailable"
        const response = await axios.put('/companions/me/availability', { availability_status: status });
        return response.data;
    },

    getPublicCompanions: async () => {
        const response = await axios.get('/companions/public');
        return response.data;
    },

    // Admin endpoints
    getPendingCompanions: async (page = 1, limit = 10) => {
        const response = await axios.get('/companions/pending', {
            params: { page, limit }
        });
        return response.data;
    },

    approveCompanion: async (id) => {
        const response = await axios.patch(`/companions/${id}/approve`);
        return response.data;
    },

    deactivateCompanion: async (id) => {
        const response = await axios.patch(`/companions/${id}/deactivate`);
        return response.data;
    }
};
