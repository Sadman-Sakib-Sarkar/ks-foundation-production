import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/Card';
import { CheckCircle } from 'lucide-react';

const RegisterPage = () => {
    const [isStaff, setIsStaff] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const endpoint = isStaff ? '/auth/register/staff/' : '/auth/register/';
        try {
            await api.post(endpoint, formData);
            setSubmitted(true);
            toast.success('Registration successful!');
        } catch (error) {
            const data = error.response?.data;
            if (data?.password) {
                // Show password specific errors (e.g. complexity requirements)
                // Password errors are returned as a list of strings
                const passwordErrors = Array.isArray(data.password) ? data.password.join(' ') : data.password;
                toast.error(passwordErrors, { duration: 5000 }); // Longer duration to read
            } else if (data?.email) {
                toast.error(Array.isArray(data.email) ? data.email[0] : data.email);
            } else if (data?.non_field_errors) {
                toast.error(data.non_field_errors[0]);
            } else {
                toast.error('Registration failed. Please check your inputs.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex justify-center items-center py-10 min-h-[60vh]">
                <Card className="w-full max-w-md border-none shadow-xl animate-fade-in dark:bg-gray-800">
                    <CardContent className="pt-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white">Check your email</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            We have sent a verification link to <span className="font-semibold text-gray-900 dark:text-gray-200">{formData.email}</span>. Please check your inbox and spam folder.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full">
                                Try another email
                            </Button>
                            <Link to="/login" className="block w-full">
                                <Button className="w-full">
                                    Proceed to Login
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center py-10">
            <Card className="w-[400px]">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                        {isStaff ? "Staff Registration" : "Member Registration"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center mb-4">
                        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-md flex transition-colors">
                            <button
                                className={`px-4 py-1 rounded-sm text-sm transition-all ${!isStaff ? 'bg-white dark:bg-gray-600 shadow dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                onClick={() => setIsStaff(false)}
                            >
                                Member
                            </button>
                            <button
                                className={`px-4 py-1 rounded-sm text-sm transition-all ${isStaff ? 'bg-white dark:bg-gray-600 shadow dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                onClick={() => setIsStaff(true)}
                            >
                                Staff
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                name="first_name"
                                placeholder="First Name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                name="last_name"
                                placeholder="Last Name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Password must be at least 8 characters long and not be too common.
                        </p>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default RegisterPage;
