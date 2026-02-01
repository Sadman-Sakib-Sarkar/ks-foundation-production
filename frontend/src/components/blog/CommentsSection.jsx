import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { Send, User as UserIcon, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';

const CommentsSection = ({ postId }) => {
    const { user } = useAuthStore();
    const location = useLocation();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/blog/comments/${deleteId}/`);
            setComments(comments.filter(c => c.id !== deleteId));
            toast.success("Comment deleted");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete comment", error);
            toast.error("Failed to delete comment");
        }
    };

    const startEditing = (comment) => {
        setEditingCommentId(comment.id);
        setEditedText(comment.text);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditedText('');
    };

    const saveEdit = async (commentId) => {
        if (!editedText.trim()) return;
        try {
            const response = await api.patch(`/blog/comments/${commentId}/`, { text: editedText });
            setComments(comments.map(c => c.id === commentId ? { ...c, text: response.data.text } : c));
            setEditingCommentId(null);
            setEditedText('');
            toast.success("Comment updated");
        } catch (error) {
            console.error("Failed to update comment", error);
            toast.error("Failed to update comment");
        }
    };

    const fetchComments = async () => {
        try {
            const response = await api.get(`/blog/comments/?post=${postId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await api.post('/blog/comments/', {
                post: postId,
                text: newComment
            });
            setComments([response.data, ...comments]);
            setNewComment('');
            toast.success('Comment posted!');
        } catch (error) {
            console.error("Failed to post comment", error);
            toast.error('Failed to post comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    return (
        <div className="space-y-6 w-full max-w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Comments ({comments.length})</h2>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
            />

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full max-w-full">
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full shrink-0">
                        <UserIcon size={24} className="text-gray-500" />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0 w-full">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y max-w-full"
                            disabled={submitting}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting || !newComment.trim()} className="gap-2">
                                {submitting ? 'Posting...' : 'Post Comment'} <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </form>

            ) : (
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg text-center border border-gray-100 dark:border-gray-700 w-full max-w-full">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Please log in to leave a comment.</p>
                    <Link to="/login" state={{ from: location }}>
                        <Button variant="outline">Log In</Button>
                    </Link>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6 w-full">
                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading comments...</div>
                ) : comments.length > 0 ? (
                    <>
                        {comments.slice(0, visibleCount).map((comment) => {
                            const userObj = typeof comment.user === 'object' ? comment.user : { first_name: '', last_name: '', email: comment.user };
                            const displayName = userObj.first_name && userObj.last_name
                                ? `${userObj.first_name} ${userObj.last_name}`
                                : (userObj.email || 'Anonymous');

                            const profilePic = userObj.profile_picture;
                            const email = userObj.email;

                            // Determine if the current viewer is admin or staff
                            const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';
                            // Determine if the user can edit/delete (Owner or Admin)
                            const canEdit = user && (user.role === 'ADMIN' || user.id === userObj.id);

                            const isEditing = editingCommentId === comment.id;

                            return (
                                <div key={comment.id} className="flex gap-4 group">
                                    <div className="shrink-0">
                                        {profilePic ? (
                                            <img
                                                src={profilePic}
                                                alt={displayName}
                                                className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full h-10 w-10 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                                <span className="font-bold text-gray-600 dark:text-gray-300">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</h4>
                                                {email && isAdminOrStaff && <span className="text-xs text-gray-500 hidden sm:inline">({email})</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {new Date(comment.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {canEdit && !isEditing && (
                                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEditing(comment)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-blue-500"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteId(comment.id)}
                                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-red-500"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Mobile email view */}
                                        {email && isAdminOrStaff && <div className="text-xs text-gray-500 sm:hidden">({email})</div>}

                                        {isEditing ? (
                                            <div className="mt-2 space-y-2">
                                                <textarea
                                                    value={editedText}
                                                    onChange={(e) => setEditedText(e.target.value)}
                                                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm"
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancel</Button>
                                                    <Button size="sm" onClick={() => saveEdit(comment.id)}>Save</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap mt-1 break-all">{comment.text}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {visibleCount < comments.length && (
                            <div className="text-center pt-4">
                                <Button variant="outline" onClick={handleLoadMore}>
                                    Load More Comments
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8 text-gray-500 italic">No comments yet. Be the first to share your thoughts!</div>
                )}
            </div>
        </div>
    );
};

export default CommentsSection;
