import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import RecaptchaNotice from '../components/RecaptchaNotice';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const location = useLocation();
    const from = location.state?.from?.pathname || ((user?.role === 'ADMIN' || user?.role === 'STAFF') ? '/dashboard' : '/');

    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, user, navigate, from]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!executeRecaptcha) {
            toast.error('reCAPTCHA not ready. Please try again.');
            return;
        }

        setIsLoading(true);
        try {
            // Get reCAPTCHA token
            const recaptchaToken = await executeRecaptcha('login');

            const result = await login(email, password, recaptchaToken);
            if (result.success) {
                toast.success('Logged in!');
                // Navigation handled by useEffect when isAuthenticated becomes true
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [executeRecaptcha, email, password, login]);

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <div className="flex items-center justify-end">
                            <Link to="/forgot-password" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </Button>

                        <RecaptchaNotice className="mt-2 text-center" />
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
