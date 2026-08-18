import React from 'react';
import { useApp } from '../context/AppContext';
import { formatUGX } from '../utils/format';
import { LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, currentUser, setDashboardTab } = useApp();

  return (
    <header
      id="main-desktop-navbar"
      className="sticky top-0 z-40 w-full bg-white/50 backdrop-blur-md border-b border-slate-200/40 shadow-xs transition"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <button
          id="brand-logo-btn"
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-violet-200 group-hover:scale-105 transition">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.3v6.7l-6-3.3V9.8zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-slate-900">Thread</span>
              <span className="text-xl font-black tracking-tight text-violet-600">Invest</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
              UGX Platform
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            id="nav-link-home"
            onClick={() => setCurrentView('landing')}
            className={`hover:text-violet-600 transition cursor-pointer ${
              currentView === 'landing' ? 'text-violet-600 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <a
            id="nav-link-how-it-works"
            href="#how-it-works-section"
            onClick={(e) => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
                setTimeout(() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-violet-600 transition cursor-pointer"
          >
            How It Works
          </a>
          <a
            id="nav-link-about"
            href="#about-section"
            onClick={(e) => {
              if (currentView !== 'landing') {
                setCurrentView('landing');
                setTimeout(() => {
                  document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="hover:text-violet-600 transition cursor-pointer"
          >
            About Us
          </a>
        </nav>

        {/* Right Section (Start Investing removed from upper navbar as requested) */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="flex items-center gap-3">
              <button
                id="nav-dashboard-btn"
                onClick={() => {
                  setCurrentView('dashboard');
                  setDashboardTab('dashboard');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 font-semibold text-sm transition cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              <div 
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2.5 pl-2 cursor-pointer"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.fullName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-violet-200"
                />
                <div className="text-left text-xs hidden sm:block">
                  <div className="font-bold text-slate-800">{currentUser.fullName}</div>
                  <div className="text-violet-600 font-semibold">{formatUGX(currentUser.balance)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
