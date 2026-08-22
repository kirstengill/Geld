/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { PageTransitionLoader } from './components/PageTransitionLoader';

const MainRouter: React.FC = () => {
  const { currentView, isNavigating, navigationMessage } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-violet-100 selection:text-violet-900 relative">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Global Modals */}
      <TopUpModal />
      <WithdrawModal />
      <InvestModal />

      {/* Cool Loading Transition Overlay */}
      <AnimatePresence>
        {isNavigating && (
          <PageTransitionLoader message={navigationMessage} isOverlay={true} />
        )}
      </AnimatePresence>

      {/* Navigation - Only on Landing Page */}
      {currentView === 'landing' && <Navbar />}

      {/* Animated Route Views */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.995 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            {currentView === 'landing' && <LandingPage />}
            {currentView === 'signin' && <SignInPage />}
            {currentView === 'signup' && <SignUpPage />}
            {currentView === 'dashboard' && <UserDashboardPage />}
            {currentView === 'admin' && <AdminDashboardPage />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer (On public landing page) */}
      {currentView === 'landing' && <Footer />}
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
