import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="w-full p-4 text-center text-sm opacity-70 mt-auto border-t border-[var(--border-color)]">
            {t('rightsReserved')}
        </footer>
    );
};

export default Footer;
