import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { UserCheck, Trash2, Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '../ui/DeleteConfirmationModal';
import debounce from 'lodash.debounce';

const UserManager = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Pagination
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchUsers = async (query = '', role = '') => {
        try {
            let url = `/auth/manage/?`;
            if (query) url += `search=${query}&`;

            if (role === 'APPLICANT') {
                url += `is_staff_applicant=true&`;
            } else if (role) {
                url += `role=${role}&`;
            }

            const response = await api.get(url);

            if (response.data.results) {
                setUsers(response.data.results);
                setNextPage(response.data.next);
            } else {
                setUsers(Array.isArray(response.data) ? response.data : []);
                setNextPage(null);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    const debouncedFetch = useCallback(
        debounce((query, role) => fetchUsers(query, role), 500),
        []
    );

    useEffect(() => {
        fetchUsers();
        return () => debouncedFetch.cancel();
    }, []);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        debouncedFetch(val, roleFilter);
    };

    const handleRoleChange = (e) => {
        const val = e.target.value;
        setRoleFilter(val);
        fetchUsers(search, val);
    };

    const handleLoadMore = async () => {
        if (!nextPage) return;
        setLoadingMore(true);
        try {
            const response = await api.get(nextPage);
            if (response.data.results) {
                setUsers(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more users", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const toggleStaffRole = async (userId) => {
        setActionLoading(userId);
        try {
            const response = await api.post(`/auth/manage/${userId}/toggle-staff/`);
            setUsers(users.map(u => u.id === userId ? response.data : u));
            toast.success("User role updated");
        } catch (error) {
            console.error("Failed to toggle staff role", error);
            toast.error("Failed to update user role");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await api.delete(`/auth/manage/${deleteId}/`);
            setUsers(users.filter(u => u.id !== deleteId));
            toast.success("User deleted successfully");
            setDeleteId(null);
        } catch (error) {
            console.error("Failed to delete user", error);
            toast.error("Failed to delete user");
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    User Management <span className="text-base font-normal text-gray-500">({users.length} visible)</span>
                </h2>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-48">
                        <select
                            value={roleFilter}
                            onChange={handleRoleChange}
                            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        >
                            <option value="">All Roles</option>
                            <option value="ADMIN">Admin</option>
                            <option value="STAFF">Staff</option>
                            <option value="USER">User</option>
                            <option value="APPLICANT">Staff Applicants</option>
                        </select>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, email or phone..."
                            className="pl-8 dark:bg-gray-700 dark:text-white"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete User?"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">User</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Current Role</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-4 dark:text-gray-300 font-medium">
                                            <button onClick={() => navigate(`/dashboard/users/${u.id}`)} className="hover:underline hover:text-blue-600 text-left">
                                                {u.first_name} {u.last_name}
                                            </button>
                                            {u.id === user.id && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                                ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                    u.role === 'STAFF' ? (
                                                        u.is_approved_staff ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                    ) :
                                                        u.is_staff_applicant ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {u.role === 'STAFF' && !u.is_approved_staff ? 'PENDING STAFF' :
                                                    u.is_staff_applicant ? 'STAFF APPLICANT' : u.role}
                                            </span>
                                        </td>
                                        <td className="p-4 flex items-center gap-2">
                                            {u.role !== 'ADMIN' && (
                                                <>
                                                    <button
                                                        onClick={() => toggleStaffRole(u.id)}
                                                        disabled={actionLoading === u.id}
                                                        title={u.role === 'STAFF' ? (u.is_approved_staff ? 'Revoke Staff' : 'Approve Staff') :
                                                            u.is_staff_applicant ? 'Approve Staff Application' : 'Promote to Staff'}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                                                            ${u.role === 'STAFF' && u.is_approved_staff ? 'bg-blue-600' :
                                                                u.role === 'STAFF' && !u.is_approved_staff ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform 
                                                            ${u.role === 'STAFF' && u.is_approved_staff ? 'translate-x-6' :
                                                                u.role === 'STAFF' && !u.is_approved_staff ? 'translate-x-3.5' : 'translate-x-1'}`} />
                                                    </button>

                                                    <button
                                                        onClick={() => setDeleteId(u.id)}
                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
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
                        {loadingMore ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent mr-2"></div>
                                Loading...
                            </>
                        ) : (
                            'Load More Users'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserManager;
