import React from 'react';
import { useApp } from '../context/AppContext';

export const RedDotAdminTrigger: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { setCurrentView, signIn, currentUser } = useApp();

  const handleAdminTrigger = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.isAdmin && localStorage.getItem('geld_admin_session') !== 'true') {
      await signIn('byte', 'byte');
    } else {
      setCurrentView('admin');
    }
  };

  return (
    <button
      id="red-dot-admin-trigger"
      onClick={handleAdminTrigger}
      aria-label="Admin Portal"
      title="Admin Portal Access"
      className={`w-2.5 h-2.5 rounded-full bg-red-950 hover:bg-red-900 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-900/40 shrink-0 inline-block align-middle ml-1.5 ${className}`}
    />
  );
};
