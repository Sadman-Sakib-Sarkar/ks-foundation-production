import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

import Footer from './Footer';

const Layout = () => {
    const fetchUser = useAuthStore(state => state.fetchUser);
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <div className="flex flex-col min-h-screen min-h-[100dvh]">
            <Navbar />
            <main className="min-h-screen container mx-auto p-4 dark:text-gray-100 flex flex-col">
                <Outlet />
            </main>
            <Footer />
            <Toaster position="top-center" />
        </div>
    );
};

export default Layout;
