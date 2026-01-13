import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
    UserPlus,
    Trash2,
    Edit,
    Moon,
    Sun,
    Shield,
    User,
    Briefcase
} from 'lucide-react';

const Settings = () => {
    const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
    const { surveyors, addSurveyor, deleteSurveyor } = useData();
    const { t } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        username: '',
        password: '',
        role: 'regular'
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Trim whitespace from inputs
        const cleanData = {
            ...formData,
            name: formData.name.trim(),
            username: formData.username.trim(),
            password: formData.password.trim()
        };

        // Check for empty fields after trim
        if (!cleanData.name || !cleanData.username || !cleanData.password) {
            alert(t('fillAllFields') || 'Please fill in all fields (whitespace only is not allowed).');
            return;
        }

        if (isEditing) {
            updateUser(cleanData.id, cleanData);
        } else {
            addUser(cleanData);
        }
        setFormData({ id: '', name: '', username: '', password: '', role: 'regular' });
        setIsEditing(false);
    };

    const handleEdit = (user) => {
        setFormData(user);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            deleteUser(id);
        }
    };

    // Only admin can access this page fully, but let's assume everyone can see simple settings
    if (currentUser?.role !== 'admin') {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">{t('settings')}</h2>
                <div className="glass p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                        <span>{t('switchLang')} / {t('theme')}</span>
                        <button onClick={toggleTheme} className="btn btn-secondary">
                            {theme === 'light' ? <Moon /> : <Sun />}
                        </button>
                    </div>
                    <p className="mt-4 text-red-500">You do not have permission to manage users.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="text-[var(--primary)]" />
                {t('settings')}
            </h2>

            <div className="grid gap-8">
                {/* Theme Setting */}
                <section className="glass p-6 rounded-xl flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Application Theme</h3>
                    <button onClick={toggleTheme} className="btn btn-secondary">
                        {theme === 'light' ? <Moon size={18} className="mr-2" /> : <Sun size={18} className="mr-2" />}
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </section>

                {/* User Management */}
                <section className="glass p-6 rounded-xl">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-[var(--secondary)]" />
                        User Management
                    </h3>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <input
                            className="input"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Username (ID)"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Password"
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <select
                            className="input"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="regular">{t('regular')}</option>
                            <option value="admin">{t('admin')}</option>
                        </select>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            {isEditing && (
                                <button type="button" onClick={() => setIsEditing(false)} className="btn bg-gray-500 text-white">
                                    {t('cancel')}
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary">
                                {isEditing ? t('save') : t('addUser')}
                            </button>
                        </div>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--secondary)]">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Username</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-light)]/5">
                                        <td className="p-3">{u.name}</td>
                                        <td className="p-3">{u.username}</td>
                                        <td className="p-3 flex items-center gap-2">
                                            {u.role === 'admin' ? <Shield size={14} className="text-yellow-500" /> : <User size={14} />}
                                            {t(u.role)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleEdit(u)} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-full mr-2">
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className={`p-2 rounded-full ${u.id === currentUser?.id || u.id === '1' ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-500/10'}`}
                                                disabled={u.id === currentUser?.id || u.id === '1'}
                                                title={u.id === currentUser?.id ? "You cannot delete yourself" : (u.id === '1' ? "Main Admin cannot be deleted" : "Delete User")}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Surveyor Management */}
                <section className="glass p-6 rounded-xl mt-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-[var(--secondary)]" />
                        Surveyor Management
                    </h3>

                    <div className="flex gap-2 mb-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const val = e.target.elements.surveyorName.value.trim();
                                if (val) {
                                    addSurveyor(val);
                                    e.target.reset();
                                }
                            }}
                            className="flex-1 flex gap-2"
                        >
                            <input
                                name="surveyorName"
                                className="input flex-1"
                                placeholder="New Surveyor Name"
                                required
                            />
                            <button type="submit" className="btn btn-primary">Add</button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {surveyors.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 bg-[var(--bg-main)] rounded-lg border border-[var(--border-color)]">
                                <span className="font-medium">{s.name}</span>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this surveyor?')) deleteSurveyor(s.id);
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {surveyors.length === 0 && <p className="opacity-50 text-sm">No surveyors found.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
};

import { Settings as SettingsIcon } from 'lucide-react'; // Fix icon usage
export default Settings;
