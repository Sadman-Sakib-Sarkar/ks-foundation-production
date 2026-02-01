import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirm_password: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirm_password) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await api.patch('/auth/password-reset-confirm/', {
                password: formData.password,
                confirm_password: formData.confirm_password,
                uidb64: uid,
                token: token
            });
            setSuccess(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Reset failed', error);
            toast.error(error.response?.data?.error || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
                <Card className="w-full max-w-md dark:bg-gray-800 border-none shadow-xl animate-fade-in">
                    <CardContent className="pt-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white">Password Reset Complete!</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your password has been successfully updated. You will be redirected to the login page shortly.
                        </p>
                        <Button onClick={() => navigate('/login')} className="w-full">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <Card className="w-full max-w-md dark:bg-gray-800 border-none shadow-xl animate-fade-in">
                <CardHeader className="space-y-1 text-center border-b dark:border-gray-700 pb-6">
                    <CardTitle className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                        <Lock className="text-blue-600" />
                        Reset Password
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create a strong and secure new password
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="Min 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                className="dark:bg-gray-700 dark:text-white"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Password must be at least 8 characters long and not be too common.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                            <Input
                                type="password"
                                name="confirm_password"
                                placeholder="Confirm new password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className="dark:bg-gray-700 dark:text-white"
                                required
                                minLength={6}
                            />
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? 'Reseting Password...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
