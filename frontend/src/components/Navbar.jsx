import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, User, Menu, X, ChevronDown, UserCheck, Camera } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout, user, isLoading } = useAuthStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProjectsOpen, setIsProjectsOpen] = useState(false);
    const location = useLocation();

    // Close menu on route change
    React.useEffect(() => {
        setIsMenuOpen(false);
        setIsProjectsOpen(false);
    }, [location]);

    if (isLoading) return null; // Prevent flickering while restoring session

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 z-50">
                            KS Foundation
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 font-medium transition-colors">Home</Link>

                            <div className="relative group">
                                <button className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-blue-500 font-medium py-2">
                                    Projects <ChevronDown size={16} />
                                </button>
                                <div className="absolute top-full left-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0">
                                    <Link to="/library" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-gray-200 text-sm">KS Library</Link>
                                    <Link to="/health" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-gray-200 text-sm">Health and Wellbeing</Link>
                                    <Link to="/community-support" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:text-gray-200 text-sm">Community Support</Link>
                                </div>
                            </div>

                            <Link to="/blog" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 font-medium transition-colors">Blog</Link>
                            <Link to="/vision" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 font-medium transition-colors">Our Vision</Link>
                            <Link to="/about" className="text-gray-700 dark:text-gray-200 hover:text-blue-500 font-medium transition-colors">About Us</Link>

                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                            <ThemeToggle />

                            {isAuthenticated ? (
                                <div className="relative group pl-2">
                                    <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
                                            {user?.profile_picture ? (
                                                <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} className="w-full h-full p-1 text-blue-600 dark:text-blue-300" />
                                            )}
                                        </div>
                                        <span className="text-sm font-semibold dark:text-white hidden lg:block">
                                            {user?.first_name || 'User'}
                                        </span>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </button>

                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                            <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.first_name} {user?.last_name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                        </div>

                                        {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                                            <Link to="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <UserCheck size={16} /> Dashboard
                                            </Link>
                                        )}

                                        <Link to="/profile" className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <User size={16} /> Edit Profile
                                        </Link>

                                        <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm shadow-blue-200 dark:shadow-none">
                                    <User size={16} /> Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <div className="md:hidden flex items-center gap-4">
                            <ThemeToggle />
                            <button onClick={toggleMenu} className="text-gray-700 dark:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <div className={`md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-950 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} pt-24 px-6 shadow-2xl overflow-y-auto`}>
                <div className="flex flex-col space-y-6 text-lg font-medium text-center">
                    <Link to="/" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 py-3 border-b border-gray-200 dark:border-gray-700">Home</Link>

                    <div className="flex flex-col items-center border-b border-gray-200 dark:border-gray-700 pb-3">
                        <button onClick={() => setIsProjectsOpen(!isProjectsOpen)} className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                            Projects <ChevronDown size={16} className={`transition-transform ${isProjectsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isProjectsOpen && (
                            <div className="flex flex-col gap-3 mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl w-full text-base animate-in slide-in-from-top-2 duration-200">
                                <Link to="/library" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">KS Library</Link>
                                <Link to="/health" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Health and Wellbeing</Link>
                                <Link to="/community-support" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">Community Support</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/blog" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 py-3 border-b border-gray-200 dark:border-gray-700">Blog</Link>
                    <Link to="/vision" className="text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 py-3 border-b border-gray-200 dark:border-gray-700">Our Vision</Link>
                    <Link to="/about" className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 py-3 border-b border-gray-200 dark:border-gray-700">About Us</Link>



                    {isAuthenticated ? (
                        <div className="flex flex-col items-center gap-6 w-full">
                            <div className="flex flex-col items-center">
                                <Link to="/profile" className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-blue-500 mb-3 shadow-md relative group">
                                    {user?.profile_picture ? (
                                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-blue-500">
                                            <User size={40} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={20} className="text-white" />
                                    </div>
                                </Link>
                                <span className="text-xl font-bold dark:text-white">{user?.first_name || 'User'}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
                            </div>

                            <div className="flex flex-col w-full gap-3 px-4">
                                {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                                    <Link to="/dashboard" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold">
                                        <UserCheck size={18} /> Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center justify-center gap-2 w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-medium">
                                    <User size={18} /> Edit Profile
                                </Link>
                                <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-3 border border-red-200 dark:border-red-900/50 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 active:scale-95 transition-all">
                            <User size={20} /> Login
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;
