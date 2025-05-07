import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const LoadingScreen = ({ message = 'Loading your content...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-whitesm from-60% via-yellowf via-95% to-yellowsm to-100% flex flex-col items-center justify-center z-50">
      <motion.div
        className="flex flex-col items-center justify-center p-8 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <img 
            src="/salemate.png" 
            alt="Salemate Logo" 
            className="h-16 md:h-20"
          />
        </div>
        
        <LoadingSpinner size="large" text={null} />
        
        <motion.p 
          className="mt-6 text-amber-800 text-center font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {message}
        </motion.p>
        
        <motion.div 
          className="mt-4 bg-amber-100 px-4 py-2 rounded-full text-amber-700 text-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          Please wait a moment...
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
