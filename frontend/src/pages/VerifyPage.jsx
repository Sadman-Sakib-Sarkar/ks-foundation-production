import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';

const VerifyPage = () => {
    return (
        <div className="flex justify-center items-center py-20">
            <Card className="w-[400px] text-center">
                <CardHeader>
                    <CardTitle>Verify Your Email</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">
                        A verification link has been sent to your email address.
                        Please check your inbox and click the link to activate your account.
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        (Since this is a demo, please check the backend console for the link/token if email is mocked)
                    </p>
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Go to Login
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
};

export default VerifyPage;
