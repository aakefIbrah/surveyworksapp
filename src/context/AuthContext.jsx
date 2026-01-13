import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const initialUsers = [
    { id: '1', username: '2599925308', password: '123', name: 'Admin User', role: 'admin' },
    { id: '2', username: 'user', password: '123', name: 'Surveyor 1', role: 'regular' }
];

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null);
    const [users, setUsers] = useState(JSON.parse(localStorage.getItem('survey_users_v1')) || initialUsers);

    useEffect(() => {
        localStorage.setItem('survey_users_v1', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }, [user]);


    const login = (id, password) => {
        const foundUser = users.find(u => u.username === id && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const addUser = (newUser) => {
        setUsers([...users, { ...newUser, id: Date.now().toString() }]);
    };

    const updateUser = (id, updates) => {
        setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const deleteUser = (id) => {
        if (id === user?.id) {
            alert("You cannot delete your own account while logged in.");
            return;
        }
        // Protect main admin account (ID '1') specifically
        if (id === '1') {
            alert("The main administrator account cannot be deleted.");
            return;
        }
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, deleteUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
