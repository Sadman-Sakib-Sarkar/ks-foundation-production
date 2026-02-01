import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, Plus, X, Pencil, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../ui/ImageUpload';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const HealthManager = () => {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [timeFilter, setTimeFilter] = useState('all');
    const [totalCamps, setTotalCamps] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date_time: '',
        doctor_name: '',
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchCamps(search);
    }, [timeFilter]);

    const fetchCamps = async (query = '') => {
        try {
            let url = '/health/camps/?';
            if (query) url += `search=${query}&`;
            if (timeFilter !== 'all') url += `time=${timeFilter}&`;
            const response = await api.get(url);
            if (response.data.results) {
                setCamps(response.data.results);
                setNextPage(response.data.next);
                setTotalCamps(response.data.count || response.data.results.length);
            } else {
                setCamps(Array.isArray(response.data) ? response.data : []);
                setNextPage(null);
                setTotalCamps(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch camps", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (!nextPage) return;
        setLoadingMore(true);
        try {
            const response = await api.get(nextPage);
            if (response.data.results) {
                setCamps(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more camps", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/health/camps/${deleteId}/`);
            setCamps(camps.filter(c => c.id !== deleteId));
            toast.success("Health camp deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete camp", error);
            toast.error("Failed to delete camp");
        }
    };

    const handleEdit = (camp) => {
        setEditingId(camp.id);
        const date = new Date(camp.date_time);
        // Format datetime-local input: YYYY-MM-DDTHH:mm
        const formattedDate = date.toISOString().slice(0, 16);

        setFormData({
            title: camp.title,
            description: camp.description || '', // Ensure valid string
            location: camp.location,
            date_time: formattedDate,
            doctor_name: camp.doctor_name,
            currentImageUrl: camp.image // Store current image URL
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            location: '',
            date_time: '',
            doctor_name: '',
        });
        setSelectedImage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'currentImageUrl') {
                data.append(key, formData[key]);
            }
        });
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (editingId) {
                const response = await api.patch(`/health/camps/${editingId}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCamps(camps.map(c => c.id === editingId ? response.data : c));
                toast.success("Health camp updated successfully");
            } else {
                const response = await api.post('/health/camps/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setCamps([response.data, ...camps]);
                toast.success("Health camp added successfully");
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save camp", error);
            toast.error(editingId ? "Failed to update camp" : "Failed to add health camp");
        }
    };

    if (loading) return <div>Loading health camps...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Health Camps Management <span className="text-base font-normal text-gray-500">({totalCamps})</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search title, location, doctor..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                fetchCamps(e.target.value);
                            }}
                        />
                    </div>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="px-3 py-2 rounded-md border border-input bg-background text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        <option value="all">All Camps</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="past">Past</option>
                    </select>
                    <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Health Camp
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Health Camp?"
                message="Are you sure you want to delete this health camp? This action cannot be undone."
            />

            <div className="grid gap-4">
                {camps.map((camp) => (
                    <div key={camp.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                        <div className="flex-1 cursor-pointer" onClick={() => handleEdit(camp)}>
                            <h3 className="font-semibold text-lg dark:text-white hover:text-blue-600 transition-colors">{camp.title}</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                                {new Date(camp.date_time).toLocaleDateString()} at {new Date(camp.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">{camp.location}</p>
                            <p className="text-sm text-gray-500 mt-1">Doctor: {camp.doctor_name}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(camp)}>
                                <Pencil size={18} />
                            </Button>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(camp.id)}>
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {nextPage && (
                <div className="flex justify-center mt-4">
                    <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 space-y-4 my-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Health Camp' : 'Add Health Camp'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date & Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.date_time}
                                        onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                                        required
                                        className="dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Location</label>
                                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Doctor Name</label>
                                <Input value={formData.doctor_name} onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })} className="dark:bg-gray-700 dark:text-white" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cover Image</label>
                                <div className="flex items-center gap-4">
                                    <ImageUpload
                                        value={selectedImage}
                                        existingUrl={formData.currentImageUrl}
                                        onChange={setSelectedImage}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full">{editingId ? 'Update Camp' : 'Create Camp'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthManager;
