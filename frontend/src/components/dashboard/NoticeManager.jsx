import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, Plus, X, Pencil, Search, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import FileUpload from '../ui/FileUpload';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const NoticeManager = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '' });
    const [attachment, setAttachment] = useState(null);
    const [existingAttachment, setExistingAttachment] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [attachmentFilter, setAttachmentFilter] = useState('all');
    const [totalNotices, setTotalNotices] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const resetForm = () => {
        setNewNotice({ title: '', content: '' });
        setAttachment(null);
        setExistingAttachment(null);
        setEditingId(null);
    };

    const handleEdit = (notice) => {
        setNewNotice({
            title: notice.title,
            content: notice.content
        });
        setExistingAttachment(notice.attachment);
        setEditingId(notice.id);
        setIsModalOpen(true);
    };

    useEffect(() => {
        fetchNotices(search);
    }, [attachmentFilter]);

    const fetchNotices = async (query = '') => {
        try {
            let url = '/core/notices/?';
            if (query) url += `search=${query}&`;
            if (attachmentFilter !== 'all') {
                url += `has_attachment=${attachmentFilter}&`;
            }
            const response = await api.get(url);
            if (response.data.results) {
                setNotices(response.data.results);
                setNextPage(response.data.next);
                setTotalNotices(response.data.count || response.data.results.length);
            } else {
                setNotices(Array.isArray(response.data) ? response.data : []);
                setNextPage(null);
                setTotalNotices(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch notices", error);
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
                setNotices(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more notices", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/core/notices/${deleteId}/`);
            setNotices(notices.filter(n => n.id !== deleteId));
            toast.success("Notice deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete notice", error);
            toast.error("Failed to delete notice");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newNotice.title);
        formData.append('content', newNotice.content);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            if (editingId) {
                const response = await api.patch(`/core/notices/${editingId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setNotices(notices.map(n => n.id === editingId ? response.data : n));
                toast.success("Notice updated successfully");
            } else {
                const response = await api.post('/core/notices/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setNotices([response.data, ...notices]);
                toast.success("Notice created successfully");
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save notice", error);
            toast.error("Failed to save notice");
        }
    };

    if (loading) return <div>Loading notices...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Notice Management <span className="text-base font-normal text-gray-500">({totalNotices})</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search title, content..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                fetchNotices(e.target.value);
                            }}
                        />
                    </div>
                    <select
                        value={attachmentFilter}
                        onChange={(e) => setAttachmentFilter(e.target.value)}
                        className="px-3 py-2 rounded-md border border-input bg-background text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        <option value="all">All Notices</option>
                        <option value="yes">With Attachment</option>
                        <option value="no">Without Attachment</option>
                    </select>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Notice
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Notice?"
                message="Are you sure you want to delete this notice? This action cannot be undone."
            />

            <div className="grid gap-4">
                {notices.map((notice) => (
                    <div key={notice.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg dark:text-white">{notice.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{notice.content}</p>
                            <p className="text-xs text-gray-400 mt-2">{new Date(notice.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2 p-2">
                            <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(notice)}>
                                <Pencil size={18} />
                            </Button>
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(notice.id)}>
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>
                ))}
                {notices.length === 0 && <p className="text-center text-gray-500">No notices found.</p>}
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

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Notice' : 'New Notice'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                <Input
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    required
                                    className="dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
                                <textarea
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows={4}
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Attachment (Image/PDF)</label>
                                <FileUpload
                                    onChange={setAttachment}
                                    value={attachment}
                                    existingUrl={existingAttachment}
                                    placeholder="Click to upload Image or PDF"
                                />
                            </div>
                            <Button type="submit" className="w-full">{editingId ? 'Update Notice' : 'Create Notice'}</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticeManager;
