import axios from './axios';

export const hospitalsApi = {
    // List all hospitals
    getAll: async () => {
        const response = await axios.get('/hospitals');
        return response.data;
    },

    // Create a new hospital (Admin only)
    create: async (data) => {
        const response = await axios.post('/hospitals', data);
        return response.data;
    },

    // Update an existing hospital (Admin only)
    update: async (id, data) => {
        const response = await axios.put(`/hospitals/${id}`, data);
        return response.data;
    },

    // Delete a hospital (Admin only)
    delete: async (id) => {
        await axios.delete(`/hospitals/${id}`);
    }
};
