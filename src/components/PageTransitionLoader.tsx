import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionLoaderProps {
  message?: string;
  isOverlay?: boolean;
}

export const PageTransitionLoader: React.FC<PageTransitionLoaderProps> = ({
  message = 'Loading...',
  isOverlay = true,
}) => {
  return (
    <motion.div
      id="page-transition-loader-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={
        isOverlay
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all'
          : 'w-full min-h-[50vh] flex flex-col items-center justify-center p-8'
      }
    >
      {/* Top glowing progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-emerald-400 z-50"
        initial={{ scaleX: 0, transformOrigin: '0%' }}
        animate={{ scaleX: [0, 0.7, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Central animated card */}
      <motion.div
        initial={{ scale: 0.9, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: -4 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-4 max-w-xs text-center"
      >
        {/* Animated Brand Emblem with glowing pulse */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-500 to-purple-600 blur-md"
          />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-violet-200 relative z-10"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2L18.8 8 12 11.8 5.2 8 12 4.2zM5 9.8l6 3.3v6.7l-6-3.3V9.8zm8 10v-6.7l6-3.3v6.7l-6 3.3z" />
            </svg>
          </motion.div>
        </div>

        {/* Brand Text */}
        <div>
          <div className="text-base font-black text-slate-900 tracking-tight">
            Thread<span className="text-violet-600">Invest</span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{message}</p>
        </div>

        {/* Pulsing Dots */}
        <div className="flex items-center gap-1.5 pt-1">
          {[0, 1, 2].map(idx => (
            <motion.div
              key={idx}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: idx * 0.2,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-violet-600"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
