import React, { createContext, useContext, useEffect, useState } from 'react';

const translations = {
    en: {
        login: "Login",
        idNumber: "ID Number",
        password: "Password",
        switchLang: "العربية",
        surveyingDept: "Surveying Department",
        companyName: "Dar Makkah Engineering Consultants",
        rightsReserved: "All rights reserved to Dar Makkah Engineering Consultants 2026",
        dashboard: "Dashboard",
        surveying: "Surveying",
        sketching: "Sketching",
        uploadBaladi: "Upload to Baladi",
        settings: "Settings",
        searchPlaceholder: "Search by Project Name, ID, Client...",
        addProject: "Add Project",
        projectNumber: "Project Number",
        projectName: "Project Name",
        clientName: "Client Name",
        clientMobile: "Client Mobile",
        projectDate: "Project Date",
        surveyorName: "Surveyor Name",
        time: "Time",
        progress: "Progress",
        status: "Status",
        transactionType: "Transaction Type",
        addWork: "Add Work",
        logout: "Logout",
        addUser: "Add User",
        editUser: "Edit User",
        deleteUser: "Delete User",
        role: "Role",
        admin: "Administrator",
        regular: "Regular User",
        save: "Save",
        cancel: "Cancel",
        actions: "Actions",
        noProjects: "No projects found.",
        complete: "Complete",
        incomplete: "Incomplete",
        workLog: "Work Log",
        fillAllFields: "Please fill in all fields (whitespace only is not allowed).",
        deleteConfirm: "Are you sure you want to delete this project?",
        edit: "Edit",
        delete: "Delete",
        confirmDelete: "Are you sure you want to delete?",
        editProject: "Edit Project",
        workUpdated: "Work Updated Successfully!",
        noProjectsExport: "No projects to export.",
        markComplete: "(Mark Complete)",
        errorAddingSurveyor: "Error adding surveyor: ",
        errorDeletingSurveyor: "Error deleting surveyor",
        errorAddingProject: "Error adding project!",
        errorDeletingProject: "Error deleting project!",
        errorUpdatingProject: "Error updating project!",
        errorUpdatingTransaction: "Error updating transaction!",
        pending: "Pending"
    },
    ar: {
        login: "تسجيل الدخول",
        idNumber: "رقم الهوية",
        password: "كلمة المرور",
        switchLang: "English",
        surveyingDept: "قسم المساحة",
        companyName: "دار مكة للاستشارات الهندسية",
        rightsReserved: "جميع الحقوق محفوظة لدار مكة للاستشارات الهندسية 2026",
        dashboard: "لوحة التحكم",
        surveying: "المساحة",
        sketching: "الكروكيات",
        uploadBaladi: "الرفع على منصة بلدي",
        settings: "الإعدادات",
        searchPlaceholder: "بحث برقم المشروع ، اسم العميل ...",
        addProject: "إضافة مشروع جديد",
        projectNumber: "رقم المعاملة",
        projectName: "اسم المشروع",
        clientName: "اسم العميل",
        clientMobile: "جوال العميل",
        projectDate: "تاريخ المشروع",
        surveyorName: "اسم المساح",
        time: "الوقت",
        progress: "الإنجاز",
        status: "الحالة",
        transactionType: "نوع المعاملة",
        addWork: "إضافة عمل",
        logout: "تسجيل خروج",
        addUser: "إضافة مستخدم",
        editUser: "تعديل مستخدم",
        deleteUser: "حذف مستخدم",
        role: "الصلاحية",
        admin: "مدير",
        regular: "مستخدم عادي",
        save: "حفظ",
        cancel: "إلغاء",
        actions: "إجراءات",
        noProjects: "لا توجد مشاريع",
        complete: "مكتمل",
        incomplete: "غير مكتمل",
        workLog: "سجل العمل",
        fillAllFields: "يرجى تعبئة جميع الحقول (المسافات فقط غير مسموح بها).",
        deleteConfirm: "هل أنت متأكد من حذف هذا المشروع؟",
        edit: "تعديل",
        delete: "حذف",
        confirmDelete: "هل أنت متأكد من الحذف؟",
        editProject: "تعديل المشروع",
        workUpdated: "تم تحديث العمل بنجاح!",
        noProjectsExport: "لا توجد مشاريع للتصدير.",
        markComplete: "(تحديد كمكتمل)",
        errorAddingSurveyor: "خطأ في إضافة المساح: ",
        errorDeletingSurveyor: "خطأ في حذف المساح",
        errorAddingProject: "خطأ في إضافة المشروع!",
        errorDeletingProject: "خطأ في حذف المشروع!",
        errorUpdatingProject: "خطأ في تحديث المشروع!",
        errorUpdatingTransaction: "خطأ في تحديث المعاملة!",
        pending: "قيد الانتظار"
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('lang') || 'ar');

    useEffect(() => {
        document.body.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.lang = language;
        localStorage.setItem('lang', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    const t = (key) => translations[language][key] || key;

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
