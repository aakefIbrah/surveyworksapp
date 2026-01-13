import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Moon, Sun, Globe, LogOut, Menu, X } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Settings from './Settings';

const Layout = () => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (location.pathname === '/') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300">
            <div className="layout relative">
                {/* Mobile Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 lg:hidden glass backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className={`main-content transition-all duration-300 w-full ${language === 'ar' ? 'lg:mr-64' : 'lg:ml-64'}`}>
                    <header className="flex justify-between items-center mb-8 glass p-4 rounded-xl sticky top-0 z-10 gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 lg:hidden hover:bg-[var(--glass-bg)] rounded-lg transition-colors"
                            >
                                <Menu size={24} />
                            </button>

                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--glass-bg)] transition-colors">
                                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                </button>
                                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-[var(--glass-bg)] transition-colors">
                                    <Globe size={18} />
                                </button>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1">
                        <Routes>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/surveying" element={<Dashboard filter="Surveying" />} />
                            <Route path="/sketching" element={<Dashboard filter="Sketching" />} />
                            <Route path="/baladi" element={<Dashboard filter="Baladi" />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </div>

                    <Footer />
                </main>
            </div>
        </div>
    );
};

// Lazy import to avoid circular dependency issues if not careful, but here standard import is fine if file structure allows.
// To make it clean, I will split Routes to App.jsx or keep here.
// I need access to Dashboard and Settings here.


export default Layout;
