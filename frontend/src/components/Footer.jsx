import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300 print:hidden relative z-10">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand & Description */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                            KS Foundation
                        </Link>
                        <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                            <p className="font-medium">Kasimuddin Sarkar Foundation</p>
                            <p>A secular, non-political, private and non-profit initiative</p>
                            <p className="text-xs text-gray-500 italic">(Currently pending Bangladesh Government registration)</p>
                            <div className="flex flex-col gap-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-500" />
                                    <span>Thakurgaon, Bangladesh</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    <span>contact@ksfoundation.org</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - Projects */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Projects</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                <Link to="/library" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    KS Library
                                </Link>
                            </li>
                            <li>
                                <Link to="/health" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Health and Wellbeing
                                </Link>
                            </li>
                            <li>
                                <Link to="/community-support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Community Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links - General */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>
                                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/vision" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Our Vision
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            {/* Add Login/Profile depending on auth state if needed, or keep simple */}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4">
                            <span>&copy; {new Date().getFullYear()} Kasimuddin Sarkar Foundation. All rights reserved.</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Social Placeholders - Update with real links if available */}
                            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Facebook size={18} /></a>
                            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                                <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                                </svg>
                            </a>
                            <a href="#" className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors"><Instagram size={18} /></a>
                            <a href="#" className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors"><Linkedin size={18} /></a>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600 flex flex-col items-center justify-center">
                        <span>Developed by</span>
                        <a
                            href="https://sadman.console.bd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group hover:text-blue-500 transition-colors font-mono mt-1"
                        >
                            sadman.console.bd
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none shadow-lg hidden md:block">
                                ✨ This site was crafted by Sadman Sakib Sarkar<br />
                                <span className="text-blue-300">Click to connect with the developer!</span>
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
