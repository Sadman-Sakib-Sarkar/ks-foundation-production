import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LibraryPage from './pages/LibraryPage';
import HealthPage from './pages/HealthPage';
import MembersPage from './pages/MembersPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminUserEditPage from './pages/AdminUserEditPage';
import AdminBlogEditorPage from './pages/AdminBlogEditorPage';
import ProtectedRoute from './components/ProtectedRoute';
import OurVisionPage from './pages/OurVisionPage';
import CommunitySupportPage from './pages/CommunitySupportPage';
import ContactPage from './pages/ContactPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/verify', element: <VerifyPage /> },
            { path: '/verify-email', element: <VerifyEmailPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
            { path: '/password-reset/:uid/:token', element: <ResetPasswordPage /> },
            { path: '/library', element: <LibraryPage /> },
            { path: '/health', element: <HealthPage /> },
            { path: '/community-support', element: <CommunitySupportPage /> },
            { path: '/about', element: <MembersPage /> },
            { path: '/blog', element: <BlogPage /> },
            { path: '/blog/:id', element: <BlogPostPage /> },
            { path: '/vision', element: <OurVisionPage /> },
            { path: '/contact', element: <ContactPage /> },

            // Protected Routes
            {
                path: '/dashboard', element: <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']} />, children: [
                    { path: '', element: <DashboardPage /> },
                    { path: 'users/:userId', element: <AdminUserEditPage /> },
                    { path: 'blog/create', element: <AdminBlogEditorPage /> },
                    { path: 'blog/edit/:id', element: <AdminBlogEditorPage /> }
                ]
            },
            {
                path: '/profile', element: <ProtectedRoute />, children: [
                    { path: '', element: <ProfilePage /> }
                ]
            },
        ],
    },
]);

export default router;
