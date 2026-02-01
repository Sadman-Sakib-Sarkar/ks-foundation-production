import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../lib/axios';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, X } from 'lucide-react';

const MembersPage = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/core/members/');
                // Handle paginated response
                if (response.data.results) {
                    setMembers(response.data.results);
                    setNextPage(response.data.next);
                } else {
                    setMembers(Array.isArray(response.data) ? response.data : []);
                    setNextPage(null);
                }
            } catch (error) {
                console.error("Failed to fetch members", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const handleLoadMore = async () => {
        if (!nextPage) return;
        setLoadingMore(true);
        try {
            const response = await api.get(nextPage);
            if (response.data.results) {
                setMembers(prev => [...prev, ...response.data.results]);
                setNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more members", error);
        } finally {
            setLoadingMore(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading members...</div>;

    return (
        <div className="space-y-12">
            <div className="relative isolate overflow-hidden bg-white dark:bg-gray-800 px-6 py-16 sm:py-24 lg:px-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="mx-auto max-w-2xl text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 mb-6">
                        About Us
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        The Kashimuddin Sarkar Foundation is a non-profit community welfare organization dedicated to serving the people. Founded by the family of the late Mr. Kasimuddin Sarkar of Thakurgaon, Bangladesh, the foundation operates with a unwavering commitment to social good.
                    </p>
                    <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
                        We are currently handling official registration processes with the Government of Bangladesh to further legitimize our efforts (pending status). We welcome your support and inquiries as we grow.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link to="/contact">
                            <Button className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <section>
                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Members</h2>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                </div>
                {members.length === 0 ? (
                    <div className="text-center text-gray-500">No members found.</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {members.map(member => (
                                <Card
                                    key={member.id}
                                    className="text-center hover:shadow-lg transition-all border-none shadow-md bg-white dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <CardContent className="p-6 flex flex-col items-center">
                                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-sm">
                                            {member.image ? (
                                                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                                    <User size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                                        <p className="text-blue-600 dark:text-blue-400 font-medium">{member.designation}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        {nextPage && (
                            <div className="flex justify-center mt-8">
                                <Button
                                    onClick={handleLoadMore}
                                    disabled={loadingMore}
                                    variant="outline"
                                    className="px-8"
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Members'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Member Details Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMember(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="relative p-6">
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-40 h-40 rounded-full overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700 border-4 border-blue-100 dark:border-gray-600 shadow-lg">
                                    {selectedMember.image ? (
                                        <img src={selectedMember.image} alt={selectedMember.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                            <User size={64} />
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedMember.name}</h2>
                                <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-4">{selectedMember.designation}</p>
                            </div>

                            {selectedMember.bio && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bio</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{selectedMember.bio}</p>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                                {selectedMember.email && (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Mail size={20} className="text-blue-500" />
                                        <a href={`mailto:${selectedMember.email}`} className="hover:text-blue-600 transition-colors">
                                            {selectedMember.email}
                                        </a>
                                    </div>
                                )}
                                {selectedMember.contact_number && (
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Phone size={20} className="text-green-500" />
                                        <span>{selectedMember.contact_number}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6">
                                <Button onClick={() => setSelectedMember(null)} variant="outline" className="w-full">
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

export default MembersPage;
