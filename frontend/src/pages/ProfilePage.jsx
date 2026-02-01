import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { User, Camera, Save, MapPin, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // profile, security

    // Profile Form Data
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        village_street: '',
        upazilla: '',
        district: '',
        division: '',
        country: 'Bangladesh',
        mobile_number: '',
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Password Form Data
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                village_street: user.village_street || '',
                upazilla: user.upazilla || '',
                district: user.district || '',
                division: user.division || '',
                country: user.country || 'Bangladesh',
                mobile_number: user.mobile_number || '',
            });
            setImagePreview(user.profile_picture);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('first_name', formData.first_name);
            data.append('last_name', formData.last_name);
            data.append('village_street', formData.village_street);
            data.append('upazilla', formData.upazilla);
            data.append('district', formData.district);
            data.append('division', formData.division);
            data.append('country', formData.country);
            data.append('mobile_number', formData.mobile_number);
            if (selectedImage) {
                data.append('profile_picture', selectedImage);
            }

            const response = await api.patch('/auth/me/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUser(response.data);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Update failed', error);
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/change-password/', passwordData);
            toast.success('Password changed successfully!');
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        } catch (error) {
            console.error('Password change failed', error);
            const data = error.response?.data;
            if (data?.new_password) {
                const passwordErrors = Array.isArray(data.new_password) ? data.new_password.join(' ') : data.new_password;
                toast.error(passwordErrors, { duration: 5000 });
            } else if (data?.old_password) {
                toast.error(Array.isArray(data.old_password) ? data.old_password[0] : data.old_password);
            } else if (data?.non_field_errors) {
                toast.error(data.non_field_errors[0]);
            } else {
                toast.error('Failed to change password. Please check your inputs.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Tabs */}
            <div className="flex justify-center mb-8 gap-4">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'profile'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <User size={20} />
                    Profile Details
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${activeTab === 'security'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <Shield size={20} />
                    Security
                </button>
            </div>

            {activeTab === 'profile' ? (
                <Card className="dark:bg-gray-800 border-none shadow-lg animate-fade-in">
                    <CardHeader className="text-center border-b dark:border-gray-700 pb-6">
                        <CardTitle className="text-2xl font-bold dark:text-white">Edit Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Profile Image */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-md bg-gray-200 dark:bg-gray-700">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <User size={64} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-lg group-hover:scale-110">
                                        <Camera size={20} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Click camera icon to change photo</p>
                            </div>

                            {/* Standard Fields */}
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

                            {/* Address Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MapPin size={16} /> Village / Street Address
                                    </label>
                                    <Input name="village_street" value={formData.village_street} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="Village, Street, House No..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upazilla / Thana</label>
                                    <Input name="upazilla" value={formData.upazilla} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="Upazilla" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
                                    <Input name="district" value={formData.district} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="District" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Division</label>
                                    <Input name="division" value={formData.division} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="Division" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                    <Input name="country" value={formData.country} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="Country" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                                    <Input name="mobile_number" value={formData.mobile_number} onChange={handleChange} className="dark:bg-gray-700 dark:text-white" placeholder="+8801700000000" />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full text-lg h-12" disabled={loading}>
                                    <Save size={20} className="mr-2" />
                                    {loading ? 'Saving Changes...' : 'Save Profile'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card className="dark:bg-gray-800 border-none shadow-lg max-w-xl mx-auto animate-fade-in">
                    <CardHeader className="text-center border-b dark:border-gray-700 pb-6">
                        <CardTitle className="text-2xl font-bold dark:text-white flex items-center justify-center gap-2">
                            <Lock className="text-blue-500" />
                            Change Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                <Input
                                    type="password"
                                    name="old_password"
                                    value={passwordData.old_password}
                                    onChange={handlePasswordChange}
                                    className="dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                <Input
                                    type="password"
                                    name="new_password"
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    className="dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Password must be at least 8 characters long and not be too common.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                <Input
                                    type="password"
                                    name="confirm_password"
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    className="dark:bg-gray-700 dark:text-white"
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" variant="default" className="w-full h-12" disabled={loading}>
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ProfilePage;
