import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import api from '../lib/axios';

const NoticeBoard = () => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Request larger page size to get all notices for frontend pagination
                const response = await api.get('/core/notices/?page_size=100');
                // Handle both paginated and non-paginated responses
                const data = response.data.results || response.data;
                setNotices(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch notices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, []);

    const [visibleCount, setVisibleCount] = useState(8);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    return (
        <>
            <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/50">
                <CardHeader className="bg-transparent border-b border-gray-100 dark:border-gray-800 pb-4">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                        <span>Notice Board</span>
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto p-4 scrollbar-thin">
                    {loading ? (
                        <div className="text-center text-sm py-8 text-gray-500">Loading notices...</div>
                    ) : notices.length > 0 ? (
                        <div className="space-y-4">
                            <ul className="space-y-3">
                                {notices.slice(0, visibleCount).map((notice, index) => {
                                    const isImage = notice.attachment?.match(/\.(jpeg|jpg|gif|png)$/i);
                                    const isLatest = index === 0;

                                    return (
                                        <li
                                            key={notice.id}
                                            className={`group p-3 rounded-lg border transition-all duration-200 cursor-pointer 
                                                ${isLatest
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                                                    : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                }`}
                                            onClick={() => setSelectedNotice(notice)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {notice.title}
                                                </h4>
                                                {isLatest && (
                                                    <span className="shrink-0 ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 rounded">
                                                        Latest
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                    {new Date(notice.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {notice.attachment && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        {isImage ? '📷 Image' : '📎 Attachment'}
                                                    </span>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {visibleCount < notices.length && (
                                <button
                                    onClick={handleLoadMore}
                                    className="w-full py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors border border-dashed border-blue-200 dark:border-blue-800"
                                >
                                    Load More Notices
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No notices available.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notice Detail Modal - Using Portal to fix z-index issues */}
            {selectedNotice && createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]" onClick={() => setSelectedNotice(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl z-[10000]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold dark:text-white pr-4">{selectedNotice.title}</h3>
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedNotice.created_at).toLocaleDateString()}
                        </div>

                        <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                            {selectedNotice.content || "No content provided."}
                        </div>

                        {selectedNotice.attachment && (
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <a
                                    href={selectedNotice.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                                >
                                    {selectedNotice.attachment.match(/\.(jpeg|jpg|gif|png)$/i) ? 'View Attached Image' : 'Download Attachment'}
                                </a>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setSelectedNotice(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default NoticeBoard;
