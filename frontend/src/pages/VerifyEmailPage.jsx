import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await api.post('/auth/verify-email/', { token });
                setStatus('success');
                setMessage(response.data.message);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="flex justify-center items-center min-h-[80vh] px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'verifying' && (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                            <p className="text-gray-600 dark:text-gray-300">Verifying your email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center space-y-4">
                            <CheckCircle2 className="h-16 w-16 text-green-500" />
                            <p className="text-green-600 dark:text-green-400 font-medium">{message}</p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Your email has been verified. You can now log in to your account.
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                            <p className="text-red-600 dark:text-red-400 font-medium">{message}</p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Please try again or request a new verification email.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center gap-4">
                    {status === 'success' && (
                        <Button onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>
                    )}
                    {status === 'error' && (
                        <Link to="/login">
                            <Button variant="outline">
                                Back to Login
                            </Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
