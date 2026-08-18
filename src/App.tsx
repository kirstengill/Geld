/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TopUpModal } from './components/TopUpModal';
import { WithdrawModal } from './components/WithdrawModal';
import { InvestModal } from './components/InvestModal';
import { ToastContainer } from './components/ToastContainer';
import { RedDotAdminTrigger } from './components/RedDotAdminTrigger';

const MainRouter: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Hidden Admin Access Red Dot (Fixed in the bottom-right corner as required) */}
      <RedDotAdminTrigger />

      {/* Global Modals */}
      <TopUpModal />
      <WithdrawModal />
      <InvestModal />

      {/* Navigation - Only on Landing Page */}
      {currentView === 'landing' && <Navbar />}

      {/* Route Views */}
      <div className="flex-1">
        {currentView === 'landing' && <LandingPage />}
        {currentView === 'signin' && <SignInPage />}
        {currentView === 'signup' && <SignUpPage />}
        {currentView === 'dashboard' && <UserDashboardPage />}
        {currentView === 'admin' && <AdminDashboardPage />}
      </div>

      {/* Footer (On public pages) */}
      {(currentView === 'landing') && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
