import axios from './axios';

export const servicesApi = {
    // Get all services
    getAll: async () => {
        const response = await axios.get('/services');
        return response.data;
    },

    // Create a new service (Admin only)
    create: async (data) => {
        const response = await axios.post('/services', data);
        return response.data;
    },

    // Update an existing service (Admin only)
    update: async (id, data) => {
        const response = await axios.put(`/services/${id}`, data);
        return response.data;
    },

    // Delete a service (Admin only)
    delete: async (id) => {
        await axios.delete(`/services/${id}`);
    },

    // Add pricing to a service (Admin only)
    addPricing: async (data) => {
        const response = await axios.post('/services/pricing', data);
        return response.data;
    },

    // Update pricing (Admin only)
    updatePricing: async (id, data) => {
        const response = await axios.put(`/services/pricing/${id}`, data);
        return response.data;
    }
};
