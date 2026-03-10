import client from './axios';

export const feedbackApi = {
    submit: async (data) => {
        const response = await client.post('/feedback', data);
        return response.data;
    },

    getMyFeedback: async () => {
        const response = await client.get('/feedback/me');
        return response.data;
    },

    getAll: async () => {
        const response = await client.get('/feedback');
        return response.data;
    }
};
