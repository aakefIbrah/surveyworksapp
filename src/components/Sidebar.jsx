import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
    LayoutDashboard,
    Map,
    FileEdit,
    UploadCloud,
    Settings,
    X,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ isOpen, onClose }) => {
    const { t, language } = useLanguage();
    const { logout } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
        { path: '/surveying', icon: Map, label: 'surveying' },
        { path: '/sketching', icon: FileEdit, label: 'sketching' },
        { path: '/baladi', icon: UploadCloud, label: 'uploadBaladi' },
        { path: '/settings', icon: Settings, label: 'settings' },
    ];

    // Determine translation classes based on language and open state
    // LTR: Hidden = -translate-x-full, Open = translate-x-0
    // RTL: Hidden = translate-x-full, Open = translate-x-0
    // Desktop (lg): Always translate-x-0

    const transformClass = language === 'ar'
        ? (isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')
        : (isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0');

    const positionClass = language === 'ar' ? 'right-0' : 'left-0';

    return (
        <aside className={`w-64 glass h-screen flex flex-col fixed top-0 ${positionClass} z-30 transition-transform duration-300 ${transformClass}`}>
            <div className="p-6 flex flex-col items-center gap-2 border-b border-[var(--border-color)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 ltr:right-4 rtl:left-4 lg:hidden p-1 hover:bg-black/10 rounded-full"
                >
                    <X size={20} />
                </button>

                <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
                <h2 className="font-bold text-center text-sm">{t('companyName')}</h2>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="flex flex-col gap-1 px-2">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-primary-gradient text-white shadow-lg shadow-blue-900/20'
                                        : 'bg-glass-hover text-main'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{t(item.label)}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-4 border-t border-[var(--border-color)] flex flex-row items-center justify-between">
                <button
                    onClick={logout}
                    title={t('logout')}
                    className="flex items-center justify-center p-2 rounded-lg transition-all hover:bg-red-500/10 text-danger"
                >
                    <LogOut size={20} />
                </button>
                <div className="text-xs text-center opacity-70">
                    v1.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
