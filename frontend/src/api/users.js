import axios from './axios';

export const usersApi = {
    getProfile: async () => {
        const response = await axios.get('/users/me');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await axios.put('/users/me', data);
        return response.data;
    }
};
