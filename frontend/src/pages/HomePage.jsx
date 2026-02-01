import React from 'react';
import Carousel from '../components/Carousel';
import NoticeBoard from '../components/NoticeBoard';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Users, ArrowRight, Info } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="space-y-16 pb-16">
            {/* 1. Hero / Carousel Section */}
            <section className="space-y-8">
                <Carousel />

                <div className="text-center max-w-4xl mx-auto px-4 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 leading-tight py-2" style={{ fontFamily: '"Noto Serif Bengali", serif' }}>
                        “হে আমার রব, আমার জ্ঞান বৃদ্ধি করে দিন।”
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium" style={{ fontFamily: '"Noto Serif Bengali", serif' }}>
                        সুরা ত্ব-হাঃ আয়াত ১১৪
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-16">

                    {/* 2. Our Vision */}
                    <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Users size={120} />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-8 h-1 bg-blue-500 rounded-full"></span>
                                Our Vision
                            </h2>
                            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-r-lg">
                                "At Kasimuddin Sarkar Foundation, our vision is to cultivate a vibrant and inclusive hub of knowledge and culture, where every member of our community is empowered to pursue lifelong learning, develop modern skills, improve health/wellbeing and inspire one another through the transformative power of books, digital resources and shared experiences."
                            </p>
                        </div>
                    </section>

                    {/* 3. Projects & Initiatives Grid */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Initiatives</h2>
                            <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Library */}
                            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                            <BookOpen size={32} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            Kasimuddin Sarkar Library
                                        </h3>

                                        <div className="text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
                                            <p>
                                                We’ve taken an initiative to develop a modern, digital technology enabled community library named “Kasimuddin Sarkar Library” in rural Thakurgaon, Bangladesh. The volunteer researchers in this library are also writing e-books on various interesting topics. These e-books will be exclusively available to the members of the library soon.
                                            </p>
                                            <p>
                                                Our mission is to provide modern and the best learning and development experience to everyone. We appreciate your help and support.
                                            </p>
                                            <p className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                The library is open for everyone from 21st February, 2025.
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <Link to="/library">
                                                <Button className="gap-2 group-hover:pl-6 transition-all bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                                                    Learn More <ArrowRight size={16} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Health */}
                            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                                            <Heart size={32} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                            Health and Wellbeing Development
                                        </h3>

                                        <div className="text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
                                            <p className="italic text-lg text-gray-800 dark:text-gray-200">
                                                "Mens sana in corpore sano"
                                                <span className="text-base font-normal text-gray-500 not-italic block mt-1">
                                                    — "a healthy mind in a healthy body"
                                                </span>
                                            </p>
                                            <p>
                                                We aim to provide quality health and wellbeing support to our community members.
                                            </p>
                                            <p>
                                                Getting the right amount of health and nutrition support is a big challenge in rural Bangladesh. We want to help as many people as possible. Quality of service is more important to us than quantity.
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <Link to="/health">
                                                <Button className="gap-2 group-hover:pl-6 transition-all bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700">
                                                    Learn More <ArrowRight size={16} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Community Support */}
                            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                                            <Users size={32} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                            Support for Communities
                                        </h3>

                                        <div className="text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
                                            <p>
                                                Education and skills development happens within the context of a larger community. Our approach extends beyond the school to help ensure students have the necessary support to do their best learning.
                                            </p>
                                        </div>

                                        <div className="pt-4">
                                            <Link to="/community-support">
                                                <Button className="gap-2 group-hover:pl-6 transition-all bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700">
                                                    Learn More <ArrowRight size={16} />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Notice Board */}
                    <div className="sticky top-24">
                        <NoticeBoard />

                        {/* Disclaimer Small Block for Sidebar Visibility */}
                        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-6">
                            <h4 className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-400 mb-3">
                                <Info size={18} /> Important Note
                            </h4>
                            <p className="text-sm text-amber-900/80 dark:text-amber-200/80 leading-relaxed mb-4">
                                Kasimuddin Sarkar Foundation is a 100% non-political, secular, private and not-for-profit (pending Bangladesh Government registration) community welfare initiative.
                            </p>
                            <p className="text-xs text-amber-800/60 dark:text-amber-300/50 italic">
                                Registration processes initiated with Bangladesh Government authorities.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Full Width Disclaimer Footer */}
            <section className="container mx-auto px-4 mt-16">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-4xl mx-auto">
                        <span className="font-bold text-gray-700 dark:text-gray-300">Disclaimer:</span> Please note, Kasimuddin Sarkar Foundation is a 100% non-political, secular, private and not-for-profit (pending Bangladesh Government registration) community welfare initiative. This has been established by the family members of late Mr. Kasimuddin Sarkar of Thakurgaon, Bangladesh.
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-4xl mx-auto">
                        Please also note, we’ve currently initiated the registration processes for this initiative with Bangladesh Government authorities. Please contact us (using the contact options below) if you’ve any questions or concerns about this.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
