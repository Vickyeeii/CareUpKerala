import axios from './axios';

export const notificationsApi = {
    // Get all notifications for the current user
    getAll: async () => {
        const response = await axios.get('/notifications');
        return response.data;
    },

    // Mark a notification as read
    markAsRead: async (id) => {
        const response = await axios.put(`/notifications/${id}/read`, { is_read: true });
        return response.data;
    },

    // Create a test notification (Admin only)
    createTest: async () => {
        const response = await axios.post('/notifications/test');
        return response.data;
    }
};
