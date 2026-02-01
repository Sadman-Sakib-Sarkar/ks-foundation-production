import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password, recaptchaToken) => {
        try {
            const response = await api.post('/auth/login/', {
                email,
                password,
                recaptcha_token: recaptchaToken
            });
            const { access, refresh, role } = response.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            set({ isAuthenticated: true });

            // Fetch user details immediately to populate store
            await get().fetchUser();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || error.response?.data?.recaptcha || 'Login failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });
    },

    setUser: (user) => set({ user }),

    fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            const response = await api.get('/auth/me/');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
            return response.data;
        } catch (error) {
            console.warn("Fetch user failed:", error); // Debug log
            set({ user: null, isAuthenticated: false, isLoading: false });
            // Don't re-throw, just let it be null. Login page handles specific login errors.
        }
    }
}));

export default useAuthStore;
