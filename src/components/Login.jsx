import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import logo from '../assets/logo.png';
import { Sun, Moon, Globe } from 'lucide-react';

const Login = () => {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const cleanId = id.trim();
        const cleanPassword = password.trim();

        if (login(cleanId, cleanPassword)) {
            navigate('/dashboard');
        } else {
            setError('Invalid ID or Password');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ paddingTop: '10vh' }}>

            <div className="absolute top-4 right-4 flex gap-4 z-10">
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-[var(--glass-bg)] transition-colors">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-[var(--glass-bg)] transition-colors flex items-center gap-1">
                    <Globe size={20} />
                    <span className="text-sm font-bold">{t('switchLang')}</span>
                </button>
            </div>

            <div className="glass p-8 rounded-2xl w-full max-w-lg z-10 mx-4 flex flex-col justify-center gap-6 shadow-2xl animate-fade-in-up" style={{ minHeight: '600px' }}>
                <div className="text-center flex flex-col items-center gap-3">
                    <img src={logo} alt="Company Logo" className="w-24 h-24 object-contain drop-shadow-lg" />
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
                        {t('companyName')}
                    </h1>
                    <h2 className="text-lg font-medium text-[var(--secondary)]">{t('surveyingDept')}</h2>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('idNumber')}</label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button type="submit" className="btn btn-primary w-full mt-2 justify-center">
                        {t('login')}
                    </button>
                </form>
            </div>

            <div className="z-10 w-full mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default Login;
