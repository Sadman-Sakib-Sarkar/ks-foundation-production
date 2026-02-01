import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Users, BookOpen, Activity, FileText, Shield, UserCheck, AlertCircle, Bell, Megaphone, Mail, BookMarked, Undo2, Image } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import UserManager from '../components/dashboard/UserManager';
import NoticeManager from '../components/dashboard/NoticeManager';
import BorrowedBookManager from '../components/dashboard/BorrowedBookManager';
import BookManager from '../components/dashboard/BookManager';
import MemberManager from '../components/dashboard/MemberManager';
import HealthManager from '../components/dashboard/HealthManager';
import BlogManager from '../components/dashboard/BlogManager';
import ContactManager from '../components/dashboard/ContactManager';
import CarouselManager from '../components/dashboard/CarouselManager';

const StatsCard = ({ title, value, icon: Icon, color, onClick }) => (
    <Card
        className={`hover:shadow-md transition-shadow dark:bg-gray-800 border-none shadow-sm ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
        onClick={onClick}
    >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize activeTab from URL or default to 'overview'
    const activeTab = searchParams.get('tab') || 'overview';

    const [stats, setStats] = useState({
        total_books: 0,
        total_members: 0,
        total_health_camps: 0,
        total_users: 0,
        admin_users: 0,
        staff_users: 0,
        regular_users: 0,
        total_posts: 0,
        total_notices: 0,
        total_messages: 0,
        unread_messages: 0,
        total_borrowed: 0,
        total_returned: 0
    });
    const [loading, setLoading] = useState(true);

    const setActiveTab = (tabId) => {
        setSearchParams({ tab: tabId });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const statsRes = await api.get('/auth/dashboard/stats/');
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        ...(user?.role === 'ADMIN' ? [{ id: 'users', label: 'Users', icon: Users }] : []),
        { id: 'carousel', label: 'Carousel', icon: Image },
        { id: 'notices', label: 'Notices', icon: Megaphone },
        { id: 'books', label: 'Books', icon: BookOpen },
        { id: 'loans', label: 'Loans', icon: AlertCircle },
        { id: 'members', label: 'Members', icon: Shield },
        { id: 'health', label: 'Health Camps', icon: Activity },
        { id: 'blog', label: 'Blog', icon: FileText },
        { id: 'inbox', label: 'Inbox', icon: Mail },
    ];

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.first_name}</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Main Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatsCard title="Total Users" value={stats.total_users} icon={Users} color="text-blue-600" onClick={() => setActiveTab('users')} />
                            <StatsCard title="Library Books" value={stats.total_books} icon={BookOpen} color="text-green-600" onClick={() => setActiveTab('books')} />
                            <StatsCard title="Health Camps" value={stats.total_health_camps} icon={Activity} color="text-red-600" onClick={() => setActiveTab('health')} />
                            <StatsCard title="Team Members" value={stats.total_members} icon={Shield} color="text-purple-600" onClick={() => setActiveTab('members')} />
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                            <StatsCard title="Blog Posts" value={stats.total_posts} icon={FileText} color="text-indigo-600" onClick={() => setActiveTab('blog')} />
                            <StatsCard title="Notices" value={stats.total_notices} icon={Megaphone} color="text-orange-600" onClick={() => setActiveTab('notices')} />
                            <StatsCard title="Messages" value={stats.total_messages} icon={Mail} color="text-pink-600" onClick={() => setActiveTab('inbox')} />
                            <StatsCard title="Books Borrowed" value={stats.total_borrowed} icon={BookMarked} color="text-amber-600" onClick={() => setActiveTab('loans')} />
                            <StatsCard title="Books Returned" value={stats.total_returned} icon={Undo2} color="text-teal-600" onClick={() => setActiveTab('loans')} />
                        </div>

                        {/* User Role Breakdown */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Role Breakdown</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                                        <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.admin_users}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Admins</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                        <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.staff_users}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Staff</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                                        <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regular_users}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Regular Users</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && <UserManager />}
                {activeTab === 'carousel' && <CarouselManager />}
                {activeTab === 'notices' && <NoticeManager />}
                {activeTab === 'books' && <BookManager />}
                {activeTab === 'loans' && <BorrowedBookManager />}
                {activeTab === 'members' && <MemberManager />}
                {activeTab === 'health' && <HealthManager />}
                {activeTab === 'blog' && <BlogManager />}
                {activeTab === 'inbox' && <ContactManager />}
            </div>
        </div>
    );
};

export default DashboardPage;

