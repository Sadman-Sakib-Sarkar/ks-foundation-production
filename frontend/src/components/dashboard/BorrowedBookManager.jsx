import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const BorrowedBookManager = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [returnId, setReturnId] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchBorrowedBooks();
    }, [statusFilter]); // Re-fetch when filter changes

    const fetchBorrowedBooks = async (query = '') => {
        setLoading(true);
        try {
            let url = '/library/borrowed-books/?';
            if (query) url += `search=${query}&`;
            if (statusFilter !== 'all') {
                url += `status=${statusFilter}&`;
            }
            const response = await api.get(url);
            if (response.data.results) {
                setBorrowedBooks(response.data.results);
                setNextPage(response.data.next);
            } else {
                setBorrowedBooks(Array.isArray(response.data) ? response.data : []);
            }
        } catch (error) {
            console.error("Failed to fetch borrowed books", error);
            toast.error("Failed to fetch records");
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
                setBorrowedBooks(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more records", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleReturn = async () => {
        if (!returnId) return;
        try {
            await api.post(`/library/borrowed-books/${returnId}/mark_returned/`);
            setBorrowedBooks(borrowedBooks.map(b =>
                b.id === returnId ? { ...b, is_returned: true, returned_date: new Date().toISOString().split('T')[0] } : b
            ));
            toast.success("Book marked as returned");
            setReturnId(null);
        } catch (error) {
            console.error("Failed to return book", error);
            toast.error("Failed to return book");
        }
    };

    const isOverdue = (dateString) => {
        const today = new Date();
        const returnDate = new Date(dateString);
        today.setHours(0, 0, 0, 0);
        returnDate.setHours(0, 0, 0, 0);
        return returnDate < today;
    };

    // We are now using backend search so remove client side filtering
    // or keep it if we want hybrid, but usually pagination means backend search
    // Let's rely on backend search since it's cleaner with pagination

    const filteredBooks = borrowedBooks;

    if (loading) return <div>Loading borrowed books...</div>;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Borrowed Books Log <span className="text-base font-normal text-gray-500">({filteredBooks.length} visible)</span>
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="all">All Records</option>
                            <option value="borrowed">Borrowed Only</option>
                            <option value="returned">Returned Only</option>
                        </select>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search records..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                fetchBorrowedBooks(e.target.value);
                            }}
                        />
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!returnId}
                onClose={() => setReturnId(null)}
                onConfirm={handleReturn}
                title="Return Book?"
                message="Are you sure you want to mark this book as returned?"
                confirmText="Confirm Return"
                confirmButtonClass="bg-green-600 hover:bg-green-700 text-white"
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Book</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Borrower</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Borrow Date</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Return Date</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBooks.map((record) => (
                                <tr key={record.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 dark:text-white">
                                        <div className="font-medium">{record.book_title}</div>
                                        <div className="text-xs text-gray-500 font-mono">{record.book_serial}</div>
                                    </td>
                                    <td className="p-4 dark:text-gray-300">{record.borrower_name}</td>
                                    <td className="p-4 dark:text-gray-300">{record.borrow_date}</td>
                                    <td className="p-4 dark:text-gray-300">{record.return_date}</td>
                                    <td className="p-4">
                                        {record.is_returned ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Returned
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                Borrowed
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center gap-2">
                                        {!record.is_returned && (
                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800" onClick={() => setReturnId(record.id)} title="Mark Returned">
                                                <CheckCircle size={16} /> Returns
                                            </Button>
                                        )}
                                        {!record.is_returned && isOverdue(record.return_date) && (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                                                Overdue
                                            </span>
                                        )}
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
        </div>
    );
};

export default BorrowedBookManager;
