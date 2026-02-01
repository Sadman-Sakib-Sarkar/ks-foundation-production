import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import api from '../lib/axios';
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Eye } from 'lucide-react';
import CommentsSection from '../components/blog/CommentsSection';

const BlogPostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasIncremented = React.useRef(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/blog/posts/${id}/`);
                setPost(response.data);

                // Increment read count only once
                if (!hasIncremented.current) {
                    hasIncremented.current = true;
                    api.post(`/blog/posts/${id}/increment_read/`);
                }
            } catch (error) {
                console.error("Failed to fetch post", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    if (loading) return <div className="text-center py-10">Loading post...</div>;
    if (!post) return <div className="text-center py-10">Post not found.</div>;

    // Configure DOMPurify to allow style attributes/tags 
    // This is often needed for preserving resizing styles on images
    const cleanHtml = DOMPurify.sanitize(post.content, {
        ADD_TAGS: ['iframe'], // Allow iframes for embeds if needed
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'], // Removed style/width/height to prevent fixed-width breakages
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6 py-8 px-4 md:px-0 overflow-x-hidden w-full">
            <Link to="/blog">
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
                </Button>
            </Link>

            {post.image && (
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 md:h-96 object-cover rounded-xl shadow-md"
                />
            )}

            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white break-words hyphens-auto font-bengali">{post.title}</h1>
                <div className="flex flex-wrap justify-between items-center text-gray-500 text-sm gap-2">
                    <span>By {post.display_author}</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Eye size={16} />
                            {post.read_count} reads
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none w-full text-gray-700 dark:text-gray-300 break-words overflow-hidden [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full [&_iframe]:w-full [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_*]:max-w-full font-bengali">
                {parse(cleanHtml)}
            </div>

            <hr className="border-gray-200 dark:border-gray-700 my-8" />

            <CommentsSection postId={post.id} />
        </div>
    );
};

export default BlogPostPage;
