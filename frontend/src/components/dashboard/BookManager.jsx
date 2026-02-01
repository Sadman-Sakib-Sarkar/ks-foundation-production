import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trash2, Plus, X, Search, Pencil, BookUp } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUpload from '../ui/ImageUpload';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const BookManager = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Pagination
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        bengali_title: '',
        author: '',
        serial_number: '',
        quantity: 1,
        is_available: true,
        category: 'Other',
        description: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Checkout State
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [checkoutBook, setCheckoutBook] = useState(null);
    const [checkoutData, setCheckoutData] = useState({
        borrower_name: '',
        borrow_date: new Date().toISOString().split('T')[0],
        return_date: ''
    });

    useEffect(() => {
        fetchBooks();
    }, [categoryFilter, availabilityFilter]); // Refetch when filters change

    const [totalBooks, setTotalBooks] = useState(0);

    // ... (rest of states)

    // ... (useEffect remains same)

    const fetchBooks = async (query = '') => {
        try {
            let url = '/library/books/?';
            if (query) url += `search=${query}&`;
            if (categoryFilter !== 'All') url += `category=${categoryFilter}&`;
            if (availabilityFilter !== 'all') url += `status=${availabilityFilter}&`;

            const response = await api.get(url);
            if (response.data.results) {
                setBooks(response.data.results);
                setNextPage(response.data.next);
                setTotalBooks(response.data.count || response.data.results.length);
            } else {
                setBooks(Array.isArray(response.data) ? response.data : []);
                setTotalBooks(Array.isArray(response.data) ? response.data.length : 0);
            }
        } catch (error) {
            console.error("Failed to fetch books", error);
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
                setBooks(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more books", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/library/books/${deleteId}/`);
            setBooks(books.filter(b => b.id !== deleteId));
            toast.success("Book deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete book", error);
            toast.error("Failed to delete book");
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            bengali_title: '',
            author: '',
            serial_number: '',
            quantity: 1,
            is_available: true,
            category: 'Other',
            description: ''
        });
        setSelectedImage(null);
        setPreviewImage(null);
        setEditingId(null);
    };

    const openModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = (book) => {
        setEditingId(book.id);
        setFormData({
            title: book.title,
            bengali_title: book.bengali_title || '',
            author: book.author,
            serial_number: book.serial_number,
            quantity: book.quantity,
            is_available: book.is_available,
            category: book.category || 'Other',
            description: book.description || ''
        });
        setPreviewImage(book.cover_image);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (selectedImage) data.append('cover_image', selectedImage);

        try {
            let response;
            if (editingId) {
                response = await api.patch(`/library/books/${editingId}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBooks(books.map(b => b.id === editingId ? response.data : b));
                toast.success("Book updated successfully");
            } else {
                response = await api.post('/library/books/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setBooks([response.data, ...books]);
                toast.success("Book added successfully");
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save book", error);
            toast.error("Failed to save book");
        }
    };

    const handleCheckout = (book) => {
        setCheckoutBook(book);
        setCheckoutData({
            borrower_name: '',
            borrow_date: new Date().toISOString().split('T')[0],
            return_date: ''
        });
        setIsCheckoutModalOpen(true);
    };

    const submitCheckout = async (e) => {
        e.preventDefault();
        try {
            await api.post('/library/borrowed-books/', {
                book: checkoutBook.id,
                ...checkoutData
            });
            toast.success("Book checked out successfully");
            setIsCheckoutModalOpen(false);
            setCheckoutBook(null);
        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Failed to checkout book");
        }
    };

    // Server-side filtering is used now, so this local filter is redundant for the main list
    // However, if we want to keep it purely client side for speed on small datasets we could.
    // But since we implemented backend search, let's rely on that or keep this as fallback?
    // Given the user request implies backend filters (e.g. they asked for filters in dashboard), 
    // and we implemented backend logic, using `books` directly is better.
    // But let's keep `books` as the source of truth from API.

    const filteredBooks = books;  // API returns filtered results now

    if (loading) return <div>Loading books...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Book Management <span className="text-base font-normal text-gray-500">({totalBooks})</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-40">
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="All">All Categories</option>
                            <option value="Novel">Novel</option>
                            <option value="Children">Children</option>
                            <option value="Academic">Academic</option>
                            <option value="Islamic">Islamic</option>
                            <option value="Fiction">Fiction</option>
                            <option value="Non-Fiction">Non-Fiction</option>
                            <option value="General Knowledge">General Knowledge</option>
                            <option value="Science Fiction">Science Fiction</option>
                            <option value="Self Help">Self Help</option>
                            <option value="History">History</option>
                            <option value="Poetry">Poetry</option>
                            <option value="Biography">Biography</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="relative w-full sm:w-40">
                        <select
                            value={availabilityFilter}
                            onChange={(e) => setAvailabilityFilter(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search books..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                fetchBooks(e.target.value);
                            }}
                        />
                    </div>
                    <Button onClick={openModal}>
                        <Plus className="mr-2 h-4 w-4" /> Add Book
                    </Button>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Book?"
                message="Are you sure you want to delete this book? This action cannot be undone."
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Serial</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Author</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Qty</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map((book) => (
                                <tr key={book.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-mono text-sm dark:text-gray-400">{book.serial_number}</td>
                                    <td className="p-4 font-medium dark:text-white">
                                        {book.title}
                                        {book.bengali_title && <span className="block text-xs text-gray-500">{book.bengali_title}</span>}
                                    </td>
                                    <td className="p-4 dark:text-gray-300">{book.author}</td>
                                    <td className="p-4 dark:text-gray-300">{book.quantity}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 p-2 h-auto" onClick={() => handleEdit(book)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-700 p-2 h-auto" onClick={() => handleCheckout(book)} title="Checkout Book">
                                                <BookUp size={16} />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 p-2 h-auto" onClick={() => setDeleteId(book.id)}>
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
                            <h3 className="text-xl font-bold dark:text-white">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
                                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bengali Title</label>
                                    <Input value={formData.bengali_title} onChange={(e) => setFormData({ ...formData, bengali_title: e.target.value })} className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="Other">Other</option>
                                        <option value="Novel">Novel</option>
                                        <option value="Children">Children</option>
                                        <option value="Academic">Academic</option>
                                        <option value="Islamic">Islamic</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fiction">Non-Fiction</option>
                                        <option value="General Knowledge">General Knowledge</option>
                                        <option value="Science Fiction">Science Fiction</option>
                                        <option value="Self Help">Self Help</option>
                                        <option value="History">History</option>
                                        <option value="Poetry">Poetry</option>
                                        <option value="Biography">Biography</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Author</label>
                                    <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Serial No</label>
                                    <Input value={formData.serial_number} onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Quantity</label>
                                    <Input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} required className="dark:bg-gray-700 dark:text-white" />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.is_available} onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })} className="h-4 w-4" />
                                        <span className="text-sm dark:text-gray-300">Available</span>
                                    </label>
                                </div>
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
                                <ImageUpload
                                    value={formData.image instanceof File ? formData.image : null}
                                    existingUrl={previewImage}
                                    onChange={(file) => {
                                        setFormData({ ...formData, image: file });
                                        setSelectedImage(file);
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setPreviewImage(reader.result);
                                            reader.readAsDataURL(file);
                                        } else {
                                            setPreviewImage(null);
                                            setSelectedImage(null);
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>

                            <Button type="submit" className="w-full">{editingId ? 'Update Book' : 'Add Book'}</Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {isCheckoutModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold dark:text-white">Checkout Book</h3>
                            <button onClick={() => setIsCheckoutModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Checking out: <span className="font-semibold text-gray-900 dark:text-white">{checkoutBook?.title}</span>
                        </div>
                        <form onSubmit={submitCheckout} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Borrower Name</label>
                                <Input
                                    value={checkoutData.borrower_name}
                                    onChange={(e) => setCheckoutData({ ...checkoutData, borrower_name: e.target.value })}
                                    required
                                    className="dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Borrow Date</label>
                                <Input
                                    type="date"
                                    value={checkoutData.borrow_date}
                                    onChange={(e) => setCheckoutData({ ...checkoutData, borrow_date: e.target.value })}
                                    required
                                    className="dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Return Date</label>
                                <Input
                                    type="date"
                                    value={checkoutData.return_date}
                                    onChange={(e) => setCheckoutData({ ...checkoutData, return_date: e.target.value })}
                                    required
                                    className="dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <Button type="submit" className="w-full">Confirm Checkout</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookManager;
