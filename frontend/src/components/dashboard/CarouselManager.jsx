import React, { useState, useEffect, useMemo } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Plus, Trash2, Edit2, Image, GripVertical, Eye, EyeOff, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../ui/ImageUpload';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const CarouselManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all', 'visible', 'hidden'
    const [visibleCount, setVisibleCount] = useState(6);
    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        order: 0,
        is_active: true,
        image: null
    });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/core/carousel/?page_size=100');
            const data = response.data.results || response.data;
            setItems(Array.isArray(data) ? data.sort((a, b) => a.order - b.order) : []);
        } catch (error) {
            console.error('Failed to fetch carousel items:', error);
            toast.error('Failed to load carousel items');
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on search query and visibility
    const filteredItems = useMemo(() => {
        let filtered = items;

        // Apply visibility filter
        if (visibilityFilter === 'visible') {
            filtered = filtered.filter(item => item.is_active);
        } else if (visibilityFilter === 'hidden') {
            filtered = filtered.filter(item => !item.is_active);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                (item.title?.toLowerCase() || '').includes(query) ||
                (item.caption?.toLowerCase() || '').includes(query)
            );
        }

        return filtered;
    }, [items, searchQuery, visibilityFilter]);

    // Paginated items
    const paginatedItems = useMemo(() => {
        return filteredItems.slice(0, visibleCount);
    }, [filteredItems, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('title', formData.title);
        data.append('caption', formData.caption);
        data.append('order', formData.order);
        data.append('is_active', formData.is_active);

        if (formData.image && typeof formData.image !== 'string') {
            data.append('image', formData.image);
        }

        try {
            if (editingItem) {
                await api.patch(`/core/carousel/${editingItem.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Carousel item updated!');
            } else {
                if (!formData.image) {
                    toast.error('Please select an image');
                    return;
                }
                await api.post('/core/carousel/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Carousel item created!');
            }
            resetForm();
            fetchItems();
        } catch (error) {
            console.error('Failed to save carousel item:', error);
            toast.error('Failed to save carousel item');
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title || '',
            caption: item.caption || '',
            order: item.order || 0,
            is_active: item.is_active !== false,
            image: item.image
        });
        setShowForm(true);
    };

    const handleDelete = async () => {
        if (!deleteModal.item) return;

        try {
            await api.delete(`/core/carousel/${deleteModal.item.id}/`);
            toast.success('Carousel item deleted!');
            fetchItems();
        } catch (error) {
            console.error('Failed to delete carousel item:', error);
            toast.error('Failed to delete carousel item');
        } finally {
            setDeleteModal({ isOpen: false, item: null });
        }
    };

    const toggleActive = async (item) => {
        try {
            await api.patch(`/core/carousel/${item.id}/`, {
                is_active: !item.is_active
            });
            toast.success(item.is_active ? 'Item hidden' : 'Item visible');
            fetchItems();
        } catch (error) {
            toast.error('Failed to update item');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingItem(null);
        setFormData({
            title: '',
            caption: '',
            order: 0,
            is_active: true,
            image: null
        });
    };

    if (loading) {
        return <div className="text-center py-8">Loading carousel items...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Carousel Management <span className="text-base font-normal text-gray-500">({items.length})</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setVisibleCount(6); // Reset pagination when searching
                            }}
                            placeholder="Search title, caption..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <select
                        value={visibilityFilter}
                        onChange={(e) => { setVisibilityFilter(e.target.value); setVisibleCount(6); }}
                        className="px-3 py-2 rounded-md border border-input bg-background text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    >
                        <option value="all">All Slides</option>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                    </select>
                    <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 whitespace-nowrap">
                        <Plus size={16} />
                        Add Slide
                    </Button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <Card className="dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>{editingItem ? 'Edit Slide' : 'Add New Slide'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Slide title (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Order</label>
                                    <Input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                        placeholder="Display order"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Caption</label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm dark:text-white"
                                    rows={3}
                                    placeholder="Slide caption (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Image</label>
                                <ImageUpload
                                    value={formData.image}
                                    onChange={(file) => setFormData({ ...formData, image: file })}
                                    aspectRatio="16/9"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label htmlFor="is_active" className="text-sm dark:text-gray-300">Active (visible on homepage)</label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">{editingItem ? 'Update' : 'Create'}</Button>
                                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Results count */}
            {searchQuery && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Found {filteredItems.length} {filteredItems.length === 1 ? 'slide' : 'slides'} matching "{searchQuery}"
                </p>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedItems.map((item) => (
                    <Card key={item.id} className={`dark:bg-gray-800 overflow-hidden ${!item.is_active ? 'opacity-60' : ''}`}>
                        <div className="relative aspect-video bg-gray-100 dark:bg-gray-700">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.title || 'Carousel slide'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                <GripVertical size={12} />
                                Order: {item.order}
                            </div>
                            {!item.is_active && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                                    Hidden
                                </div>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold dark:text-white truncate">
                                {item.title || 'Untitled Slide'}
                            </h3>
                            {item.caption && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {item.caption}
                                </p>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(item)}
                                    className="flex-1"
                                >
                                    <Edit2 size={14} className="mr-1" /> Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => toggleActive(item)}
                                    title={item.is_active ? 'Hide slide' : 'Show slide'}
                                >
                                    {item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteModal({ isOpen: true, item })}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Load More Button */}
            {visibleCount < filteredItems.length && (
                <div className="text-center">
                    <Button variant="outline" onClick={handleLoadMore} className="w-full sm:w-auto">
                        Load More ({filteredItems.length - visibleCount} remaining)
                    </Button>
                </div>
            )}

            {filteredItems.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    {searchQuery ? (
                        <p>No slides found matching "{searchQuery}"</p>
                    ) : (
                        <p>No carousel slides yet. Add your first slide!</p>
                    )}
                </div>
            )}

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, item: null })}
                onConfirm={handleDelete}
                title="Delete Carousel Slide"
                message={`Are you sure you want to delete "${deleteModal.item?.title || 'this slide'}"?`}
            />
        </div>
    );
};

export default CarouselManager;
