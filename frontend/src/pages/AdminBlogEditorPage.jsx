import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';

ReactQuill.Quill.register('modules/imageResize', ImageResize);

const AdminBlogEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const [loading, setLoading] = useState(isEditing);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        author_name: '',
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);

    useEffect(() => {
        if (isEditing) {
            fetchPost();
        } else {
            // Optional: Pre-fill with current user name if you wanted, but blank implies "use account name"
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await api.get(`/blog/posts/${id}/`);
            setFormData({
                title: response.data.title,
                content: response.data.content,
                author_name: response.data.author_name || '',
            });
            setCurrentImageUrl(response.data.image);
        } catch (error) {
            console.error("Failed to fetch post", error);
            toast.error("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('author_name', formData.author_name);
        if (selectedImage) data.append('image', selectedImage);

        try {
            if (isEditing) {
                await api.patch(`/blog/posts/${id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Blog post updated successfully");
            } else {
                await api.post('/blog/posts/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Blog post created successfully");
            }
            navigate('/dashboard?tab=blog');
        } catch (error) {
            console.error("Failed to save post", error);
            toast.error("Failed to save post");
        }
    };

    if (loading) return <div className="text-center py-10">Loading editor...</div>;

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
        ],
        imageResize: {
            parchment: ReactQuill.Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize']
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 py-8">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold dark:text-white">
                    {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h1>
                <Link to="/dashboard?tab=blog">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </Button>
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="text-lg font-semibold dark:bg-gray-700 dark:text-white"
                        placeholder="Enter post title..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Author Name (Optional)</label>
                    <Input
                        value={formData.author_name}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        className="dark:bg-gray-700 dark:text-white"
                        placeholder="Override author name (e.g. Guest Author)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cover Image</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedImage(e.target.files[0])}
                            className="w-full text-sm dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                        />
                        {currentImageUrl && !selectedImage && (
                            <img src={currentImageUrl} alt="Current cover" className="h-16 w-16 object-cover rounded-md border" />
                        )}
                    </div>
                </div>

                <div className="text-gray-900 dark:text-white">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Content</label>
                    <div className="h-[500px] mb-12">
                        {/* Added height and margin bottom to account for toolbar */}
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(value) => setFormData({ ...formData, content: value })}
                            className="h-full dark:bg-white dark:text-black rounded-lg overflow-hidden flex flex-col"
                            modules={modules}
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <Link to="/dashboard?tab=blog">
                        <Button type="button" variant="outline" size="lg">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" size="lg" className="w-full md:w-auto">
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? 'Update Post' : 'Publish Post'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminBlogEditorPage;
