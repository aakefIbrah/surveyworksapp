import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Search,
    Filter,
    CheckCircle,
    Clock,
    Briefcase,
    AlertCircle,
    Trash2,
    Edit
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { amiriFont } from '../assets/Amiri-Regular.js';
import { reshapeArabic } from '../utils/arabic-shaper';

const Dashboard = ({ filter }) => {
    const { projects, addProject, updateProjectTransaction, deleteProject, editProject, surveyors } = useData();
    const { t, language } = useLanguage();
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProject, setEditingProject] = useState(null);

    // Work Station State
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState('');
    const [newWork, setNewWork] = useState({ status: 'pending' });

    const initialProjectState = {
        number: '',
        name: '',
        clientName: '',
        clientMobile: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        surveyor: user?.name || ''
    };

    // Add Project Form State
    const [newProject, setNewProject] = useState(initialProjectState);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        setNewProject(initialProjectState);
    };

    const handleAddProject = (e) => {
        e.preventDefault();

        // Trim and Validate
        const cleanProject = {
            ...newProject,
            number: newProject.number.trim(),
            name: newProject.name.trim(),
            clientName: newProject.clientName.trim(),
            clientMobile: newProject.clientMobile.trim()
        };

        if (!cleanProject.number || !cleanProject.name || !cleanProject.clientName || !cleanProject.clientMobile) {
            alert(t('fillAllFields'));
            return;
        }

        if (editingProject) {
            editProject(editingProject.id, cleanProject);
        } else {
            // Use the selected surveyor from the form, or fallback to current user if not selected
            const assignedSurveyor = cleanProject.surveyor || user?.name || 'Unknown';

            addProject({
                ...cleanProject,
                surveyor: assignedSurveyor, // Store the name here
                surveyorName: assignedSurveyor, // And here to be safe for display
                time: new Date().toLocaleTimeString()
            });
        }
        setIsModalOpen(false);
        setEditingProject(null);
        setNewProject({ ...newProject, number: '', name: '', clientName: '', clientMobile: '', surveyor: user?.name || '' });
    };

    const openEditModal = (project) => {
        setEditingProject(project);
        setNewProject({
            number: project.number,
            name: project.name,
            clientName: project.clientName,
            clientMobile: project.clientMobile,
            date: project.date,
            time: project.time,
            surveyor: project.surveyor || user?.name || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteProject = (id) => {
        if (window.confirm(t('deleteConfirm'))) {
            deleteProject(id);
        }
    };

    const handleUpdateTransaction = () => {
        if (selectedProjectId && selectedTransaction) {
            updateProjectTransaction(selectedProjectId, selectedTransaction, newWork.status);
            alert(t('workUpdated'));
            setSelectedProjectId('');
            setSelectedTransaction('');
            setNewWork({ status: 'pending' });
        }
    };

    const handleExportPDF = () => {
        if (projects.length === 0) return alert(t('noProjectsExport'));

        console.log("Starting PDF Export");
        console.log("Amiri Font Length:", amiriFont ? amiriFont.length : "Undefined");

        // Debug first project
        if (projects.length > 0) {
            console.log("First Project Name:", projects[0].name);
            console.log("Shaped Name:", reshapeArabic(projects[0].name));
            console.log("Shaped Codes:", reshapeArabic(projects[0].name).split('').map(c => c.charCodeAt(0).toString(16)).join(' '));
        }

        const doc = new jsPDF();

        // Register font with simplified name "Amiri"
        doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');

        // Set font globally before adding any text
        doc.setFont('Amiri');

        // Add Title
        doc.setFontSize(18);
        doc.text(reshapeArabic(t('workLog')), 180, 22, { align: 'right' });

        // Add Date
        doc.setFontSize(11);
        doc.text(reshapeArabic(`${new Date().toLocaleDateString()}`), 180, 30, { align: 'right' });

        // Define Columns
        const tableColumn = [
            reshapeArabic(t('projectName')),
            reshapeArabic(t('transactionType')),
            reshapeArabic(t('surveyorName')),
            reshapeArabic(t('status')),
            reshapeArabic(t('projectDate'))
        ];

        // Define Rows
        const tableRows = [];

        projects.forEach(project => {
            project.transactions.forEach(transaction => {
                const rowData = [
                    reshapeArabic(project.name),
                    reshapeArabic(transaction.type),
                    reshapeArabic(project.surveyorName || project.surveyor),
                    reshapeArabic(transaction.status === 'complete' ? t('complete') : t('pending')),
                    reshapeArabic(transaction.date ? new Date(transaction.date).toLocaleDateString() : (project.date || new Date().toLocaleDateString()))
                ];
                tableRows.push(rowData);
            });
        });

        // Generate Table

        // Manual RTL Support for AutoTable Columns (Visual)
        if (language === 'ar') {
            tableColumn.reverse();
            tableRows.forEach(row => row.reverse());
        }

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: {
                fontSize: 10,
                cellPadding: 3,
                font: 'Amiri',
                halign: 'right'
            },
            headStyles: {
                fillColor: [66, 133, 244], // Primary Blue
                textColor: [255, 255, 255],
                halign: 'center',
                font: 'Amiri',
                fontStyle: 'normal'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            }
        });

        // Save PDF
        doc.save('work_log.pdf');
    };

    const filteredProjects = useMemo(() => {
        return projects.filter(p => {
            const matchesSearch =
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.number.includes(searchTerm) ||
                p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.clientMobile.includes(searchTerm);

            if (filter) {
                return matchesSearch;
            }
            return matchesSearch;
        });
    }, [projects, searchTerm, filter]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">

            {/* Top Actions: Add Project & Work Station */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Project Card */}
                <div className="glass p-6 rounded-xl flex items-center justify-between bg-primary-gradient text-white">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">{t('addProject')}</h2>
                        <p className="opacity-80 text-sm">Create a new project entry to start tracking.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-[var(--primary)] p-4 rounded-full hover:scale-105 transition-transform shadow-lg"
                    >
                        <Plus size={24} />
                    </button>
                </div>

                {/* Work Station */}
                <div className="glass p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-[var(--secondary)]" />
                        {t('addWork')}
                    </h3>
                    <div className="flex flex-col gap-3">
                        <select
                            className="input"
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                        >
                            <option value="">Select Project...</option>
                            {projects.filter(p => !p.completed).map(p => (
                                <option key={p.id} value={p.id}>{p.number} - {p.name}</option>
                            ))}
                        </select>

                        {selectedProjectId && (
                            <select
                                className="input animate-fade-in"
                                value={selectedTransaction}
                                onChange={e => setSelectedTransaction(e.target.value)}
                            >
                                <option value="">Select Transaction...</option>
                                <option value="Surveying">{t('surveying')}</option>
                                <option value="Sketching">{t('sketching')}</option>
                                <option value="Baladi">{t('uploadBaladi')}</option>
                            </select>
                        )}

                        <button
                            disabled={!selectedProjectId || !selectedTransaction}
                            onClick={handleUpdateTransaction}
                            className="btn btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <label className="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" checked={newWork.status === 'complete'} onChange={(e) => setNewWork({ ...newWork, status: e.target.checked ? 'complete' : 'pending' })} />
                                {t('addWork')} {t('markComplete')}
                            </label>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4 flex-wrap">
                <div
                    className="flex-1 min-w-[200px] flex items-center gap-2 px-3 rounded-lg focus-within:ring-2 focus-within:ring-[var(--secondary)] transition-all"
                    style={{ height: '42px', backgroundColor: 'transparent', border: '1px solid var(--border-color)' }}
                >
                    <Search className="text-[var(--secondary)] flex-shrink-0" size={20} />
                    <input
                        className="flex-1 border-none outline-none text-inherit placeholder-opacity-70 p-0 focus:ring-0 appearance-none text-lg h-full"
                        style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            color: 'var(--text-main)',
                            textAlign: language === 'ar' ? 'right' : 'left'
                        }}
                        className1="input pl-10 w-full md:w-96"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        autoComplete="off"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                    />
                </div>
                <button
                    onClick={handleExportPDF}
                    className="btn btn-secondary"
                >
                    <Filter size={18} className="mr-2" /> Export Log (PDF)
                </button>
            </div>

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.length === 0 ? (
                    <div className="col-span-full text-center py-10 opacity-50">
                        {t('noProjects')}
                    </div>
                ) : (
                    filteredProjects.map(project => (
                        <div key={project.id} className="glass rounded-xl overflow-hidden hover:shadow-xl transition-shadow relative group">
                            <div className={`h-2 w-full ${project.completed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{project.name}</h3>
                                        <p className="text-xs opacity-60">#{project.number}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                                            className="p-1.5 text-[var(--text-main)] hover:text-blue-500 transition-colors opacity-60 hover:opacity-100 rounded-full hover:bg-blue-500/10"
                                            title={t('edit')}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                                            className="p-1.5 text-[var(--text-main)] hover:text-red-500 transition-colors opacity-60 hover:opacity-100 rounded-full hover:bg-red-500/10"
                                            title={t('delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${project.completed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {project.completed ? '100%' : `${project.progress}%`}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm opacity-80 mb-4">
                                    <p className="flex justify-between"><span>Client:</span> <b>{project.clientName}</b></p>
                                    <p className="flex justify-between"><span>Mobile:</span> <span>{project.clientMobile}</span></p>
                                    <p className="flex justify-between"><span>Surveyor:</span> <span>{project.surveyorName}</span></p>
                                    <p className="flex justify-between"><span>Date:</span> <span>{project.date}</span></p>
                                </div>

                                <div className="space-y-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                                    {project.transactions
                                        .filter(t => !filter || t.type === filter)
                                        .map(t => (
                                            <div key={t.type} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1">
                                                    {t.status === 'complete' ? <CheckCircle size={12} className="text-green-500" /> : <Clock size={12} className="text-yellow-500" />}
                                                    {t.type}
                                                </span>
                                                <span className={t.status === 'complete' ? 'text-green-500 font-bold' : 'text-yellow-600'}>
                                                    {t.status === 'complete' ? 'Done' : 'Pending'}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass bg-[var(--bg-main)] p-8 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-bold mb-6">{editingProject ? t('editProject') : t('addProject')}</h2>
                        <form onSubmit={handleAddProject} className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input className="input" placeholder={t('projectNumber')} required value={newProject.number} onChange={e => setNewProject({ ...newProject, number: e.target.value })} />
                                <input className="input" placeholder={t('projectName')} required value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="input" placeholder={t('clientName')} required value={newProject.clientName} onChange={e => setNewProject({ ...newProject, clientName: e.target.value })} />
                                <input className="input" placeholder={t('clientMobile')} required value={newProject.clientMobile} onChange={e => setNewProject({ ...newProject, clientMobile: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="input" type="date" required value={newProject.date} onChange={e => setNewProject({ ...newProject, date: e.target.value })} />
                                <input className="input" type="text" disabled value={newProject.time} />
                            </div>

                            <select
                                className="input"
                                value={newProject.surveyor}
                                onChange={e => setNewProject({ ...newProject, surveyor: e.target.value })}
                                required
                            >
                                <option value="">{t('surveyorName')}</option>
                                {surveyors && surveyors.length > 0 ? (
                                    surveyors.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))
                                ) : (
                                    <option disabled>No surveyors found</option>
                                )}
                            </select>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={handleCloseModal} className="btn hover:bg-[var(--glass-bg)]">{t('cancel')}</button>
                                <button type="submit" className="btn btn-primary">{t('save')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
