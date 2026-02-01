import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, Plus, Pencil, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import debounce from 'lodash.debounce';

const BlogManager = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');

    const fetchPosts = async (query = '') => {
        try {
            const url = query
                ? `/blog/posts/?search=${query}`
                : '/blog/posts/';
            const response = await api.get(url);

            if (response.data.results) {
                setPosts(response.data.results);
                setNextPage(response.data.next);
            } else {
                setPosts(Array.isArray(response.data) ? response.data : []);
                setNextPage(null);
            }
        } catch (error) {
            console.error("Failed to fetch posts", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    const debouncedFetch = useCallback(
        debounce((query) => fetchPosts(query), 500),
        []
    );

    useEffect(() => {
        fetchPosts();
        return () => debouncedFetch.cancel();
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        debouncedFetch(value);
    };

    const handleLoadMore = async () => {
        if (!nextPage) return;
        setLoadingMore(true);
        try {
            const response = await api.get(nextPage);
            if (response.data.results) {
                setPosts(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more posts", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/blog/posts/${deleteId}/`);
            setPosts(posts.filter(p => p.id !== deleteId));
            toast.success("Post deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete post", error);
            toast.error("Failed to delete post");
        }
    };

    const getPlainText = (html) => {
        // Replace tags with spaces to prevent words from merging (e.g. </h1><p>)
        // Then decode HTML entities and trim
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html.replace(/<[^>]+>/g, ' ');
        return tempDiv.textContent || tempDiv.innerText || "";
    };

    if (loading) return <div>Loading posts...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Blog Management</h2>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search posts..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <Button onClick={() => navigate('/dashboard/blog/create')}>
                        <Plus className="mr-2 h-4 w-4" /> New Post
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
            />

            {posts.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No posts found</h3>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4 overflow-hidden">
                                <div className="flex flex-col sm:flex-row gap-4 cursor-pointer flex-1 min-w-0" onClick={() => navigate(`/dashboard/blog/edit/${post.id}`)}>
                                    {post.image && <img src={post.image} alt={post.title} className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-md flex-shrink-0" />}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-lg dark:text-white hover:text-primary-600 transition-colors truncate">{post.title}</h3>
                                        <p className="text-sm text-gray-500 mb-2 truncate">By {post.display_author} • {new Date(post.created_at).toLocaleDateString()}</p>
                                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 text-sm break-all">
                                            {getPlainText(post.content).slice(0, 200)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-2 items-center self-end sm:self-center flex-shrink-0">
                                    <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/blog/edit/${post.id}`); }}>
                                        <Pencil size={18} />
                                    </Button>
                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); setDeleteId(post.id); }}>
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
                                {loadingMore ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogManager;
