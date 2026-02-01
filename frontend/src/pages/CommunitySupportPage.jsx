import React from 'react';
import { Users, HeartHandshake, School } from 'lucide-react';

const CommunitySupportPage = () => {
    return (
        <div className="space-y-12">
            <section className="text-center space-y-4 max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                    Community Support
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                    Empowering our community through education and skills development.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                <Users size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Plan</h2>
                        </div>

                        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                            <p>
                                We have a comprehensive plan to support for the community. Education and skills development happens within the context of a larger community.
                            </p>
                            <p>
                                Our approach extends beyond the school to help ensure students have the necessary support to do their best learning.
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-6 rounded-r-xl">
                        <p className="text-amber-800 dark:text-amber-200 font-medium italic">
                            "More details to come soon..."
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800/50 p-6 rounded-xl border border-blue-100 dark:border-gray-700 flex items-start gap-4">
                        <School className="text-blue-500 mt-1 shrink-0" size={24} />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Education Focus</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Supporting students with resources and guidance to excel in their academic pursuits.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800/50 p-6 rounded-xl border border-green-100 dark:border-gray-700 flex items-start gap-4">
                        <HeartHandshake className="text-green-500 mt-1 shrink-0" size={24} />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Community Welfare</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Building a stronger, supportive environment where every member can thrive.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunitySupportPage;
