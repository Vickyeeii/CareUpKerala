import axios from './axios';

export const dashboardApi = {
    // Platform overview statistics
    getOverview: async () => {
        const response = await axios.get('/dashboard/admin/overview');
        return response.data;
    },

    // Financial metrics
    getRevenue: async () => {
        const response = await axios.get('/dashboard/admin/revenue');
        return response.data;
    },

    // Booking counts by status
    getBookingStatus: async () => {
        const response = await axios.get('/dashboard/admin/bookings/status');
        return response.data;
    },

    // Complaint counts by status
    getComplaintSummary: async () => {
        const response = await axios.get('/dashboard/admin/complaints/summary');
        return response.data;
    },

    // Companion statistics
    getCompanionSummary: async () => {
        const response = await axios.get('/dashboard/admin/companions/summary');
        return response.data;
    }
};
