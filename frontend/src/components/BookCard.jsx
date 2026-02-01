import React from 'react';
import { Card, CardContent } from './ui/Card';
import { BookOpen } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const BookCard = ({ book, onClick }) => {
    const { user } = useAuthStore();
    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-all dark:bg-gray-800 border-none shadow-md group cursor-pointer"
            onClick={onClick}
        >
            <div className="h-56 bg-gray-200 dark:bg-gray-700 w-full relative overflow-hidden">
                {book.cover_image ? (
                    <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                        <BookOpen size={48} className="mb-2 opacity-50" />
                        <span className="text-sm">No Cover</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${book.is_available
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        {book.is_available ? 'Available' : 'Out'}
                    </span>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1" title={book.title}>
                    {book.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">{book.author}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t dark:border-gray-700">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                        #{book.serial_number}
                    </span>
                    {user && <span>{book.quantity} copies</span>}
                </div>
            </CardContent>
        </Card>
    );
};

export default BookCard;
