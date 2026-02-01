import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Calendar, MapPin, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';

const HealthPage = () => {
    const [upcomingCamps, setUpcomingCamps] = useState([]);
    const [pastCamps, setPastCamps] = useState([]);
    const [upcomingNextPage, setUpcomingNextPage] = useState(null);
    const [pastNextPage, setPastNextPage] = useState(null);
    const [loadingUpcoming, setLoadingUpcoming] = useState(false);
    const [loadingPast, setLoadingPast] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const response = await api.get('/health/camps/?time=upcoming');
                if (response.data.results) {
                    setUpcomingCamps(response.data.results);
                    setUpcomingNextPage(response.data.next);
                } else {
                    setUpcomingCamps(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                console.error("Failed to fetch upcoming camps", error);
            }
        };

        const fetchPast = async () => {
            try {
                const response = await api.get('/health/camps/?time=past');
                if (response.data.results) {
                    setPastCamps(response.data.results);
                    setPastNextPage(response.data.next);
                } else {
                    setPastCamps(Array.isArray(response.data) ? response.data : []);
                }
            } catch (error) {
                console.error("Failed to fetch past camps", error);
            }
        };

        fetchUpcoming();
        fetchPast();
    }, []);

    const loadMoreUpcoming = async () => {
        if (!upcomingNextPage) return;
        setLoadingUpcoming(true);
        try {
            const response = await api.get(upcomingNextPage);
            if (response.data.results) {
                setUpcomingCamps(prev => [...prev, ...response.data.results]);
                setUpcomingNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more upcoming camps", error);
        } finally {
            setLoadingUpcoming(false);
        }
    };

    const loadMorePast = async () => {
        if (!pastNextPage) return;
        setLoadingPast(true);
        try {
            const response = await api.get(pastNextPage);
            if (response.data.results) {
                setPastCamps(prev => [...prev, ...response.data.results]);
                setPastNextPage(response.data.next);
            }
        } catch (error) {
            console.error("Failed to load more past camps", error);
        } finally {
            setLoadingPast(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4 max-w-4xl mx-auto py-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-400">
                    Health and Wellbeing
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                    Caring for our community. Providing essential health services and promoting wellbeing for a healthier tomorrow.
                </p>
            </div>
            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Upcoming Health Camps</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingCamps.length > 0 ? upcomingCamps.map(camp => (
                        <CampCard key={camp.id} camp={camp} isUpcoming onClick={() => setSelectedCamp(camp)} />
                    )) : (
                        <p className="text-gray-500 dark:text-gray-400">No upcoming camps scheduled.</p>
                    )}
                </div>
                {upcomingNextPage && (
                    <div className="flex justify-center mt-6">
                        <Button onClick={loadMoreUpcoming} disabled={loadingUpcoming} variant="outline">
                            {loadingUpcoming ? 'Loading...' : 'Load More Upcoming'}
                        </Button>
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Past Camps Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastCamps.length > 0 ? pastCamps.map(camp => (
                        <CampCard key={camp.id} camp={camp} isPast onClick={() => setSelectedCamp(camp)} />
                    )) : (
                        <p className="text-gray-500 dark:text-gray-400">No past camps found.</p>
                    )}
                </div>
                {pastNextPage && (
                    <div className="flex justify-center mt-6">
                        <Button onClick={loadMorePast} disabled={loadingPast} variant="outline">
                            {loadingPast ? 'Loading...' : 'Load More Past Camps'}
                        </Button>
                    </div>
                )}
            </section>

            {/* Camp Details Modal */}
            {selectedCamp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCamp(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                            {selectedCamp.image ? (
                                <img src={selectedCamp.image} alt={selectedCamp.title} className="w-full h-64 object-cover rounded-t-lg" />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-lg">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                            <button
                                onClick={() => setSelectedCamp(null)}
                                className="absolute top-4 right-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
                            >
                                <X size={24} />
                            </button>
                            {new Date(selectedCamp.date_time) > new Date() && (
                                <div className="absolute top-4 left-4 bg-green-600/90 text-white text-sm px-3 py-1 rounded backdrop-blur-sm">
                                    Upcoming
                                </div>
                            )}
                            {new Date(selectedCamp.date_time) <= new Date() && (
                                <div className="absolute top-4 left-4 bg-gray-800/90 text-white text-sm px-3 py-1 rounded backdrop-blur-sm">
                                    Completed
                                </div>
                            )}
                        </div>
                        <div className="p-6 space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCamp.title}</h2>

                            <div className="space-y-2 text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-3">
                                    <Calendar size={20} className="text-blue-500" />
                                    <span>{format(new Date(selectedCamp.date_time), 'PPPp')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={20} className="text-red-500" />
                                    <span>{selectedCamp.location}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User size={20} className="text-green-500" />
                                    <span>{selectedCamp.doctor_name}</span>
                                </div>
                            </div>

                            {selectedCamp.description && (
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedCamp.description}</p>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button onClick={() => setSelectedCamp(null)} variant="outline" className="w-full">
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

const CampCard = ({ camp, isPast, isUpcoming, onClick }) => (
    <Card
        className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer dark:bg-gray-800 border-none shadow-md ${isPast ? 'opacity-90' : ''}`}
        onClick={onClick}
    >
        <div className="h-40 bg-gray-200 dark:bg-gray-700 w-full relative">
            {camp.image ? (
                <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">No Image</div>
            )}
            {isPast && <div className="absolute top-2 right-2 bg-gray-800/90 dark:bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Completed</div>}
            {isUpcoming && <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm shadow-sm animate-pulse">Upcoming</div>}
        </div>
        <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg dark:text-white">{camp.title}</h3>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{format(new Date(camp.date_time), 'PPp')}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{camp.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>{camp.doctor_name}</span>
                </div>
            </div>
        </CardContent>
    </Card>
);

export default HealthPage;
