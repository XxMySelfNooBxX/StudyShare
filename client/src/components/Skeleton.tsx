import React from 'react';
import { m } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <m.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ 
        repeat: Infinity, 
        repeatType: 'reverse', 
        duration: 0.8,
        ease: 'easeInOut' 
      }}
      className={`bg-slate-700/50 rounded-md ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        backgroundSize: '200% 100%',
      }}
    />
  );
};

export default Skeleton;
