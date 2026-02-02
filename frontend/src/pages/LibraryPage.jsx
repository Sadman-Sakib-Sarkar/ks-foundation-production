import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import BookCard from '../components/BookCard';
import { FileSpreadsheet, Printer, Search, LayoutGrid, List as ListIcon, Filter, X } from 'lucide-react';
import debounce from 'lodash.debounce';
import { utils, writeFile, write } from 'xlsx';

const LibraryPage = () => {
    const { user } = useAuthStore();
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
    const [filter, setFilter] = useState('newest'); // 'newest' | 'oldest' | 'available'

    const [category, setCategory] = useState('All');
    const [selectedBook, setSelectedBook] = useState(null);

    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchBooks = async (query = '', cat = category) => {
        setLoading(true);
        try {
            const url = cat && cat !== 'All'
                ? `/library/books/?search=${query}&category=${cat}`
                : `/library/books/?search=${query}`;
            const response = await api.get(url);

            if (response.data.results) {
                setBooks(response.data.results);
                setNextPage(response.data.next);
                setFilteredBooks(response.data.results);
            } else {
                // Fallback
                const data = Array.isArray(response.data) ? response.data : [];
                setBooks(data);
                setFilteredBooks(data);
                setNextPage(null);
            }
        } catch (error) {
            console.error("Error fetching books", error);
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
                const newBooks = [...books, ...response.data.results];
                setBooks(newBooks);
                setFilteredBooks(newBooks); // Update filtered books to include new ones
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Error loading more books", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const debouncedSearch = useRef(
        debounce((query) => {
            fetchBooks(query);
        }, 500)
    ).current;

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setCategory(newCategory);
        fetchBooks(search, newCategory);
    };

    // Apply client-side filters/sorting EFFECT MOVED TO RENDER or maintained?
    // Note: With server-side pagination, client-side filtering/sorting acts ONLY on the currently loaded page of data.
    // Ideally sorting should be server-side too, but for now we keep it simple or acknowledge limitation.
    // The previous implementation used client-side filtering on `books` to set `filteredBooks`. 
    // We update `filteredBooks` in `useEffect` below.

    useEffect(() => {
        let result = [...books];

        // Filter
        if (filter === 'available') {
            result = result.filter(book => book.is_available);
        }

        // Sort
        if (filter === 'newest') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (filter === 'oldest') {
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        setFilteredBooks(result);
    }, [books, filter]);

    // Initial load
    useEffect(() => {
        fetchBooks();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleExcelExport = async () => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const filename = `KSL_Library_Books_${date}.xlsx`;

            // Show loading toast or indicator? For now just console/fetch
            const loadingToast = document.createElement('div');
            loadingToast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50';
            loadingToast.textContent = 'Preparing export...';
            document.body.appendChild(loadingToast);

            // Fetch ALL books using large page_size
            const response = await api.get('/library/books/?page_size=10000');
            const allBooks = response.data.results || [];

            const data = allBooks.map((b, index) => ({
                "Serial No": b.serial_number,
                "Title": b.title,
                "Bengali Title": b.bengali_title || '-',
                "Category": b.category || 'Other',
                "Author": b.author,
                "Status": b.is_available ? 'Available' : 'Checked Out',
                "Quantity": b.quantity
            }));

            const worksheet = utils.json_to_sheet(data);

            // Auto-width for columns
            const wscols = [
                { wch: 15 }, // Serial
                { wch: 40 }, // Title
                { wch: 30 }, // Bengali Title
                { wch: 20 }, // Category
                { wch: 25 }, // Author
                { wch: 15 }, // Status
                { wch: 10 }  // Qty
            ];
            worksheet['!cols'] = wscols;

            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, "Library Books");

            const wbout = write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);

            document.body.removeChild(loadingToast);
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export books");
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4 max-w-4xl mx-auto py-8 no-print">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                    KS Library
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                    Empowering minds through knowledge. Access our digital and physical collection to fuel your personal and professional growth.
                </p>
            </div>

            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 no-print">
                <h2 className="text-xl font-bold dark:text-white shrink-0">Catalog</h2>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by title, author..."
                            className="pl-8 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="w-full pl-8 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={category}
                            onChange={handleCategoryChange}
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

                    {/* Sort Filter */}
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="w-full pl-8 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={filter}
                            onChange={handleFilterChange}
                        >
                            <option value="newest">Newest Added</option>
                            <option value="oldest">Oldest Added</option>
                            <option value="available">Available Only</option>
                        </select>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                            title="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    {/* Actions - Only for Admin/Staff */}
                    {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" /> Print
                            </Button>
                            <Button variant="outline" onClick={handleExcelExport}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading books...</div>
            ) : filteredBooks.length > 0 ? (
                <div className="space-y-6">
                    {/* Screen View */}
                    <div className="no-print">
                        {viewMode === 'list' ? (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-900/50 border-b dark:border-gray-700">
                                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Serial</th>
                                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Title</th>
                                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 hidden md:table-cell">Author</th>
                                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBooks.map((book) => (
                                                <tr key={book.id} onClick={() => setSelectedBook(book)} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                                                    <td className="p-4 dark:text-gray-300 font-mono text-sm">{book.serial_number}</td>
                                                    <td className="p-4 font-medium sticky left-0 bg-white dark:bg-gray-800 md:static dark:text-white shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] md:shadow-none">
                                                        <div className="flex items-center gap-3">
                                                            {book.cover_image && (
                                                                <img src={book.cover_image} alt="" className="w-8 h-10 object-cover rounded shadow-sm hidden sm:block" />
                                                            )}
                                                            <div>
                                                                <div>{book.title}</div>
                                                                {book.bengali_title && <div className="text-xs text-gray-500">{book.bengali_title}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 dark:text-gray-300 hidden md:table-cell">{book.author}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${book.is_available ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                            {book.is_available ? 'Available' : 'Out'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredBooks.map(book => (
                                    <BookCard key={book.id} book={book} onClick={() => setSelectedBook(book)} />
                                ))}
                            </div>
                        )}

                        {nextPage && (
                            <div className="flex justify-center mt-8 no-print">
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
                                        'Load More Books'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Print Only Table */}
                    <div className="hidden print:block">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">KS Foundation Library Catalog</h2>
                            <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                        </div>
                        <table className="w-full text-left border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="p-2 border-r border-gray-300 font-bold w-24">Serial No</th>
                                    <th className="p-2 border-r border-gray-300 font-bold">Title</th>
                                    <th className="p-2 border-r border-gray-300 font-bold">Bengali Title</th>
                                    <th className="p-2 border-r border-gray-300 font-bold">Category</th>
                                    <th className="p-2 border-r border-gray-300 font-bold">Author</th>
                                    <th className="p-2 border-r border-gray-300 font-bold w-24">Stock</th>
                                    <th className="p-2 font-bold w-24">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map((book) => (
                                    <tr key={book.id} className="border-b border-gray-300">
                                        <td className="p-2 border-r border-gray-300 font-mono">{book.serial_number}</td>
                                        <td className="p-2 border-r border-gray-300">{book.title}</td>
                                        <td className="p-2 border-r border-gray-300 font-noto">{book.bengali_title || '-'}</td>
                                        <td className="p-2 border-r border-gray-300">{book.category || 'Other'}</td>
                                        <td className="p-2 border-r border-gray-300">{book.author}</td>
                                        <td className="p-2 border-r border-gray-300 text-center">{user ? book.quantity : '-'}</td>
                                        <td className="p-2 text-center">
                                            {book.is_available ? 'Available' : 'Out'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 no-print">
                    <Search className="mx-auto h-12 w-12 opacity-20 mb-4" />
                    <p className="text-lg">No books found matching your criteria.</p>
                </div>
            )}

            <style>{`
                @media print {
                    .no-print, nav, footer, .toaster, button { display: none !important; }
                    
                    body { 
                        background-color: white !important;
                        color: black !important;
                        font-family: "Times New Roman", serif !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }

                    /* Global Print Reset: Remove all shadows and unintended borders */
                    * {
                        box-shadow: none !important;
                        text-shadow: none !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Table Styling */
                    table { 
                        width: 100% !important;
                        border-collapse: collapse !important;
                        border: 2px solid #000 !important;
                        margin: 0 auto !important; /* Center table */
                    }
                    
                    thead { display: table-header-group !important; }
                    tr { page-break-inside: avoid !important; }
                    
                    th { 
                        background-color: #f3f4f6 !important;
                        color: #000 !important;
                        font-weight: 800 !important;
                        font-size: 12pt !important;
                        border: 1px solid #000 !important;
                        padding: 8px !important;
                        text-align: center !important;
                    }
                    
                    td { 
                        color: #000 !important;
                        font-size: 11pt !important;
                        border: 1px solid #000 !important;
                        padding: 8px !important;
                        vertical-align: middle !important;
                    }
                    
                    /* Specific column alignments */
                    td:nth-child(5), td:nth-child(6) { text-align: center !important; }

                    /* Page Setup */
                    @page { margin: 15mm; size: auto; }
                }
            `}</style>

            {/* Book Details Modal */}
            {selectedBook && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBook(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        {/* Image Side */}
                        <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-700 relative h-64 md:h-auto">
                            {selectedBook.cover_image ? (
                                <img
                                    src={selectedBook.cover_image}
                                    alt={selectedBook.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <span className="text-sm">No Cover</span>
                                </div>
                            )}
                            <div className="absolute top-2 left-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${selectedBook.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {selectedBook.is_available ? 'Available' : 'Out'}
                                </span>
                            </div>
                        </div>

                        {/* Content Side */}
                        <div className="w-full md:w-2/3 p-6 flex flex-col relative">
                            <button
                                onClick={() => setSelectedBook(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="mb-6 pr-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                                    {selectedBook.title}
                                </h2>
                                {selectedBook.bengali_title && (
                                    <h3 className="text-lg text-gray-500 dark:text-gray-400 font-noto">
                                        {selectedBook.bengali_title}
                                    </h3>
                                )}
                            </div>

                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Author</span>
                                        <span className="font-medium dark:text-white">{selectedBook.author}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Category</span>
                                        <span className="font-medium dark:text-white">{selectedBook.category || 'Other'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Serial No</span>
                                        <span className="font-mono dark:text-white">{selectedBook.serial_number}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold">Stock</span>
                                        <span className="font-medium dark:text-white">{user ? `${selectedBook.quantity} copies` : 'Login to view'}</span>
                                    </div>
                                </div>

                                {selectedBook.description && (
                                    <div>
                                        <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Description</span>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedBook.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                                <Button onClick={() => setSelectedBook(null)} variant="outline">
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default LibraryPage;
