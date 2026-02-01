import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, Plus, X, Pencil, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import ImageUpload from '../ui/ImageUpload';

const MemberManager = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalMembers, setTotalMembers] = useState(0);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        bio: '',
        contact_number: '',
        email: '',
        order: 0,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async (query = '') => {
        try {
            let url = '/core/members/';
            if (query) url += `?search=${query}`;
            const response = await api.get(url);
            // Handle paginated response
            if (response.data.results) {
                setMembers(response.data.results.sort((a, b) => a.order - b.order));
                setNextPage(response.data.next);
                setTotalMembers(response.data.count || response.data.results.length);
            } else {
                setMembers(Array.isArray(response.data) ? response.data.sort((a, b) => a.order - b.order) : []);
                setNextPage(null);
                setTotalMembers(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch members", error);
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
                setMembers(prev => [...prev, ...response.data.results].sort((a, b) => a.order - b.order));
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more members", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/core/members/${deleteId}/`);
            setMembers(members.filter(m => m.id !== deleteId));
            toast.success("Member deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete member", error);
            toast.error("Failed to delete member");
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            bio: '',
            contact_number: '',
            email: '',
            order: 0,
        });
        setSelectedImage(null);
        setPreviewImage(null);
        setEditingId(null);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (member) => {
        setEditingId(member.id);
        setFormData({
            name: member.name,
            role: member.designation, // Assuming designation maps to role
            bio: member.bio,
            contact_number: member.contact_number || '',
            email: member.email || '',
            order: member.order,
        });
        setPreviewImage(member.image);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('designation', formData.role); // Map role to designation
        data.append('bio', formData.bio);
        data.append('contact_number', formData.contact_number);
        data.append('email', formData.email);
        data.append('order', formData.order);
        if (selectedImage) data.append('image', selectedImage);

        try {
            let response;
            if (editingId) {
                response = await api.patch(`/core/members/${editingId}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMembers(members.map(m => m.id === editingId ? response.data : m).sort((a, b) => a.order - b.order));
                toast.success("Member updated successfully");
            } else {
                response = await api.post('/core/members/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMembers([...members, response.data].sort((a, b) => a.order - b.order));
                toast.success("Member added successfully");
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save member", error);
            toast.error("Failed to save member");
        }
    };

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    if (loading) return <div>Loading members...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Member Management <span className="text-base font-normal text-gray-500">({totalMembers})</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search name, email, contact..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                fetchMembers(e.target.value);
                            }}
                        />
                    </div>
                    <Button onClick={openModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Team Member
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Member?"
                message="Are you sure you want to delete this team member? This action cannot be undone."
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Order</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Role</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 dark:text-gray-400">{member.order}</td>
                                    <td className="p-4 font-medium dark:text-white flex items-center gap-3">
                                        {member.image && <img src={member.image} alt={member.name} className="w-8 h-8 rounded-full object-cover" />}
                                        {member.name}
                                    </td>
                                    <td className="p-4 dark:text-gray-300">{member.designation}</td>
                                    <td className="p-4 dark:text-gray-300 text-sm">
                                        {member.email && <div>{member.email}</div>}
                                        {member.contact_number && <div>{member.contact_number}</div>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 p-2 h-auto" onClick={() => handleEdit(member)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-2 h-auto" onClick={() => setDeleteId(member.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                            <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Role</label>
                                    <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="dark:bg-gray-700 dark:text-white" placeholder="Designation" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
                                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contact Number</label>
                                    <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows={3}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Order Priority</label>
                                    <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Profile Image</label>
                                <ImageUpload
                                    value={selectedImage}
                                    existingUrl={previewImage}
                                    onChange={(file) => {
                                        setSelectedImage(file);
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setPreviewImage(reader.result);
                                            reader.readAsDataURL(file);
                                        } else {
                                            setPreviewImage(null);
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>

                            <Button type="submit" className="w-full">{editingId ? 'Update Member' : 'Add Member'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberManager;
