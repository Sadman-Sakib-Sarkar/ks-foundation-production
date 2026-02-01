import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/password-reset/', { email });
            setSubmitted(true);
            toast.success('Reset link sent to your email.');
        } catch (error) {
            console.error('Reset request failed', error);
            // Don't reveal exact error security-wise, but toast generic
            toast.success('If an account exists, email sent.');
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
                <Card className="w-full max-w-md dark:bg-gray-800 border-none shadow-xl animate-fade-in">
                    <CardContent className="pt-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white">Check your email</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We have sent a password reset link to <span className="font-semibold text-gray-900 dark:text-gray-200">{email}</span>. Please check your inbox and spam folder.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
                                Try another email
                            </Button>
                            <Link to="/login" className="text-blue-600 hover:underline text-sm">
                                Back to Login
                            </Link>
                        </div>
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
                        <Mail className="text-blue-600" />
                        Forgot Password?
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your email address to verify your account
                    </p>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={loading}>
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t dark:border-gray-700 pt-6">
                    <Link to="/login" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
