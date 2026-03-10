import axios from './axios';

export const adminApi = {
    getOverview: async () => {
        const response = await axios.get('/dashboard/admin/overview');
        return response.data;
    },
    getLogs: async (page = 1, limit = 10) => {
        const response = await axios.get('/admin-logs', {
            params: { page, limit }
        });
        return response.data;
    }
};
