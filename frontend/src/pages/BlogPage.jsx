import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../lib/axios';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { Calendar, User, Clock, ArrowRight, BookOpen, Search } from 'lucide-react';
import { Input } from '../components/ui/Input';
import debounce from 'lodash.debounce';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const getExcerpt = (htmlContent, length = 100) => {
        const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
        return doc.body.textContent || "";
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="relative py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden text-center">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] pointer-events-none"></div>
                <div className="relative z-10 max-w-2xl mx-auto px-4 space-y-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold font-bengali tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 mb-4">
                            Our Community Stories
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-bengali">
                            Insights, updates, and inspiring stories from our journey in serving the community.
                        </p>
                    </div>

                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search stories by title or author..."
                            value={search}
                            onChange={handleSearchChange}
                            className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <Card key={post.id} className="group flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                                {/* Image Section */}
                                <Link to={`/blog/${post.id}`} className="block overflow-hidden h-48 relative bg-gray-200 dark:bg-gray-700">
                                    {post.image ? (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40">
                                            <BookOpen size={40} className="text-blue-300 dark:text-blue-700/50" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                                        {post.read_count} Reads
                                    </div>
                                </Link>

                                <CardContent className="flex-1 p-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Link to={`/blog/${post.id}`} className="block group-hover:text-blue-600 transition-colors">
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 font-bengali leading-snug">
                                                {post.title}
                                            </h2>
                                        </Link>
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed font-bengali">
                                        {parse(DOMPurify.sanitize(post.content).substring(0, 300) + '...')}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-6 pt-0 mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <User size={14} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                                            {post.display_author}
                                        </span>
                                    </div>
                                    <Link to={`/blog/${post.id}`}>
                                        <Button variant="ghost" size="sm" className="group/btn text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0 pr-2 h-auto">
                                            Read More <ArrowRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {nextPage && (
                        <div className="flex justify-center mt-12">
                            <Button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                variant="outline"
                                className="min-w-[150px]"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More Posts'
                                )}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogPage;
