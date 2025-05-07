import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  // Size variants
  const sizes = {
    small: {
      container: 'w-8 h-8',
      circle: 'w-8 h-8 border-2',
      text: 'text-xs mt-2'
    },
    medium: {
      container: 'w-12 h-12',
      circle: 'w-12 h-12 border-3',
      text: 'text-sm mt-3'
    },
    large: {
      container: 'w-16 h-16',
      circle: 'w-16 h-16 border-4',
      text: 'text-base mt-4'
    }
  };

  const sizeClass = sizes[size] || sizes.medium;

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`${sizeClass.circle} rounded-full border-amber-500 border-t-transparent`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          ease: "linear",
          repeat: Infinity
        }}
      />
      {text && (
        <p className={`${sizeClass.text} text-amber-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
