import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [projects, setProjects] = useState([]);
    const [surveyors, setSurveyors] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSurveyors = async () => {
        const { data, error } = await supabase
            .from('surveyors')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error('Error fetching surveyors:', error);
        else setSurveyors(data || []);
    };

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
        } else {
            setProjects(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
        fetchSurveyors();
    }, []);

    const addSurveyor = async (name) => {
        const { data, error } = await supabase
            .from('surveyors')
            .insert([{ name }])
            .select();

        if (error) {
            console.error('Error adding surveyor:', error);
            console.error('Error adding surveyor:', error);
            alert('Error adding surveyor: ' + error.message);
        } else {
            setSurveyors([...surveyors, data[0]]);
        }
    };

    const deleteSurveyor = async (id) => {
        const { error } = await supabase
            .from('surveyors')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting surveyor:', error);
            alert('Error deleting surveyor');
        } else {
            setSurveyors(surveyors.filter(s => s.id !== id));
        }
    };

    const addProject = async (project) => {
        const newProject = {
            ...project,
            completed: false,
            progress: 0,
            transactions: [
                { type: 'Surveying', status: 'pending' },
                { type: 'Sketching', status: 'pending' },
                { type: 'Baladi', status: 'pending' }
            ]
        };

        const { data, error } = await supabase
            .from('projects')
            .insert([newProject])
            .select();

        if (error) {
            console.error('Error adding project:', error);
            alert('Error adding project!');
        } else if (data) {
            setProjects(prev => [data[0], ...prev]);
        }
    };

    const deleteProject = async (id) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project!');
        } else {
            setProjects(prev => prev.filter(p => p.id !== id));
        }
    };

    const editProject = async (id, updatedData) => {
        const { error } = await supabase
            .from('projects')
            .update(updatedData)
            .eq('id', id);

        if (error) {
            console.error('Error updating project:', error);
            alert('Error updating project!');
        } else {
            setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
        }
    };

    const updateProjectTransaction = async (projectId, type, status) => {
        const projectToUpdate = projects.find(p => p.id === projectId);
        if (!projectToUpdate) return;

        const updatedTransactions = projectToUpdate.transactions.map(t =>
            t.type === type ? { ...t, status, date: new Date().toISOString() } : t
        );

        const totalTransactions = updatedTransactions.length;
        const completedTransactions = updatedTransactions.filter(t => t.status === 'complete').length;
        const progress = Math.round((completedTransactions / totalTransactions) * 100);
        const completed = progress === 100;

        const { error } = await supabase
            .from('projects')
            .update({ transactions: updatedTransactions, progress, completed })
            .eq('id', projectId);

        if (error) {
            console.error('Error updating transaction:', error);
            alert('Error updating transaction!');
        } else {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, transactions: updatedTransactions, progress, completed };
                }
                return p;
            }));
        }
    };

    return (
        <DataContext.Provider value={{
            projects,
            addProject,
            updateProjectTransaction,
            deleteProject,
            editProject,
            loading,
            fetchProjects,
            surveyors,
            addSurveyor,
            deleteSurveyor
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
