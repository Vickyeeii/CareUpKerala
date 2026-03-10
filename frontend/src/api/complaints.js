import axios from './axios';

export const complaintsApi = {
    // Create a new complaint (User)
    create: async (data) => {
        const response = await axios.post('/complaints', data);
        return response.data;
    },

    // Get my complaints (User)
    getMyComplaints: async (page = 1, limit = 10) => {
        const response = await axios.get('/complaints/me', {
            params: { page, limit }
        });
        return response.data;
    },

    // Get all complaints (Admin)
    getAll: async (page = 1, limit = 10) => {
        const response = await axios.get('/complaints', {
            params: { page, limit }
        });
        return response.data;
    },

    // Update complaint status/response (Admin)
    updateStatus: async (id, data) => {
        const response = await axios.put(`/complaints/${id}`, data);
        return response.data;
    }
};
