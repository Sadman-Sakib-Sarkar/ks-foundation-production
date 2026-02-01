import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Trash2, Mail, ExternalLink, Search } from 'lucide-react';
import { Input } from '../ui/Input';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import debounce from 'lodash.debounce';

const ContactManager = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    // Pagination
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchMessages = async (query = '') => {
        try {
            const url = query
                ? `/core/contact/?search=${query}`
                : '/core/contact/';
            const response = await api.get(url);

            if (response.data.results) {
                setMessages(response.data.results);
                setNextPage(response.data.next);
            } else {
                setMessages(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Failed to fetch contact messages", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    const debouncedFetch = useCallback(
        debounce((query) => fetchMessages(query), 500),
        []
    );

    useEffect(() => {
        fetchMessages();
        return () => debouncedFetch.cancel();
    }, []);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedFetch(e.target.value);
    };

    const handleLoadMore = async () => {
        if (!nextPage) return;
        setLoadingMore(true);
        try {
            const response = await api.get(nextPage);
            if (response.data.results) {
                setMessages(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more messages", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/core/contact/${deleteId}/`);
            setMessages(messages.filter(m => m.id !== deleteId));
            toast.success("Message deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete message", error);
            toast.error("Failed to delete message");
        }
    };

    if (loading) return <div>Loading messages...</div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Contact Messages <span className="text-base font-normal text-gray-500">({messages.length} visible)</span>
                </h2>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Message?"
                message="Are you sure you want to delete this message? This action cannot be undone."
            />

            {messages.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No messages found.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{msg.subject}</h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            From: <span className="font-medium text-gray-900 dark:text-gray-200">{msg.name}</span> &lt;{msg.email}&gt;
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors" title="Reply">
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={() => setDeleteId(msg.id)} // Set ID directly
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
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
                                {loadingMore ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Messages'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ContactManager;
