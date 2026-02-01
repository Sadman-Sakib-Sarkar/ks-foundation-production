import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { User, Camera, Save, MapPin, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';

const AdminUserEditPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'USER',
        village_street: '',
        upazilla: '',
        district: '',
        division: '',
        country: 'Bangladesh',
        mobile_number: '',
        is_verified: false,
    });
    const [imagePreview, setImagePreview] = useState(null);

    const isSuperUser = currentUser?.is_superuser;
    const isSelf = currentUser?.id === parseInt(userId);
    const isTargetAdmin = formData.role === 'ADMIN';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/auth/manage/${userId}/`);
                const userData = response.data;
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    role: userData.role || 'USER',
                    village_street: userData.village_street || '',
                    upazilla: userData.upazilla || '',
                    district: userData.district || '',
                    division: userData.division || '',
                    country: userData.country || 'Bangladesh',
                    mobile_number: userData.mobile_number || '',
                    is_verified: userData.is_verified || false,
                });
                setImagePreview(userData.profile_picture);
            } catch (error) {
                console.error("Error fetching user", error);
                toast.error("Failed to load user data");
                navigate('/dashboard?tab=users');
            } finally {
                setFetching(false);
            }
        };

        if (userId) fetchUser();
    }, [userId, navigate]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Filter out empty strings or send as is
            const data = { ...formData };

            // For simple updates we can just send JSON unless we update image later (not implemented here for simplicity/safety)
            // But API expects PATCH usually

            await api.patch(`/auth/manage/${userId}/`, data);
            toast.success('User updated successfully!');
            navigate('/dashboard?tab=users');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="text-center py-10">Loading user data...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard?tab=users')}>
                <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
            </Button>

            <Card className="dark:bg-gray-800 border-none shadow-lg">
                <CardHeader className="text-center border-b dark:border-gray-700 pb-6">
                    <CardTitle className="text-2xl font-bold dark:text-white">Edit User: {formData.first_name} {formData.last_name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                                <Input name="first_name" value={formData.first_name} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                                <Input name="last_name" value={formData.last_name} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Read Only)</label>
                            <Input value={formData.email} readOnly className="dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={isSelf || (isTargetAdmin && !isSuperUser)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="USER">User</option>
                                    <option value="STAFF">Staff</option>
                                    {(isSuperUser || isTargetAdmin) && <option value="ADMIN">Admin</option>}
                                </select>
                                {isSelf && <p className="text-xs text-amber-500">You cannot change your own role.</p>}
                                {isTargetAdmin && !isSuperUser && <p className="text-xs text-amber-500">Only Superusers can manage Administrators.</p>}
                            </div>
                            <div className="space-y-2 flex flex-col justify-end pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_verified"
                                        checked={formData.is_verified}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified User</span>
                                </label>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="border-t dark:border-gray-700 pt-4">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">Address Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin size={16} /> Village / Street Address
                                    </label>
                                    <Input name="village_street" value={formData.village_street} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upazilla</label>
                                    <Input name="upazilla" value={formData.upazilla} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
                                    <Input name="district" value={formData.district} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Division</label>
                                    <Input name="division" value={formData.division} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                    <Input name="country" value={formData.country} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                                    <Input name="mobile_number" value={formData.mobile_number} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                                <Save size={20} className="mr-2" />
                                {loading ? 'Saving Changes...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUserEditPage;
