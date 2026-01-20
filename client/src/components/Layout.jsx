import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, LogOut, User } from 'lucide-react';
import Button from './ui/Button';

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col bg-secondary-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                                <Heart size={18} fill="currentColor" />
                            </div>
                            <span className="text-xl font-bold text-primary-800 tracking-tight">HopeConnect</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-6">
                            {user.email && (
                                <>
                                    <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary-600' : 'text-stone-600 hover:text-primary-600'}`}>
                                        Dashboard
                                    </Link>
                                    <Link to="/donate" className={`text-sm font-medium transition-colors ${isActive('/donate') ? 'text-primary-600' : 'text-stone-600 hover:text-primary-600'}`}>
                                        Donate
                                    </Link>
                                    {user.role === 'ADMIN' && (
                                        <Link to="/admin" className={`text-sm font-medium transition-colors ${isActive('/admin') ? 'text-primary-600' : 'text-stone-600 hover:text-primary-600'}`}>
                                            Admin
                                        </Link>
                                    )}
                                    <div className="h-4 w-px bg-stone-300 mx-2"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-stone-700">{user.name}</span>
                                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-stone-500 hover:text-red-600">
                                            <LogOut size={18} />
                                        </Button>
                                    </div>
                                </>
                            )}
                            {!user.email && (
                                <div className="space-x-2">
                                    <Link to="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                                    <Link to="/register"><Button size="sm">Get Started</Button></Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-600 hover:text-primary-600 p-2">
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-stone-200">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {user.email ? (
                                <>
                                    <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-primary-700 hover:bg-stone-50">Dashboard</Link>
                                    <Link to="/donate" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:text-primary-700 hover:bg-stone-50">Donate</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-stone-50">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50">Login</Link>
                                    <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary-700 hover:bg-stone-50">Register</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-primary-900 text-primary-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Heart size={20} className="text-primary-300" fill="currentColor" />
                            <span className="text-xl font-bold text-white tracking-tight">HopeConnect</span>
                        </div>
                        <p className="text-primary-200/80 text-sm leading-relaxed max-w-xs">
                            Connecting generous hearts with meaningful causes. Making the world a better place, one donation at a time.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-primary-200/80">
                            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link to="/donate" className="hover:text-white transition-colors">Donate Now</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Our Impact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact</h4>
                        <p className="text-primary-200/80 text-sm mb-2">123 Charity Lane, Kindness City</p>
                        <p className="text-primary-200/80 text-sm">support@hopeconnect.org</p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-primary-800 text-center text-xs text-primary-400">
                    &copy; {new Date().getFullYear()} HopeConnect NGO. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
