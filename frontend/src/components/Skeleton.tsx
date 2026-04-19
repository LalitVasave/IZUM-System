import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClass = "animate-pulse bg-surface-container-highest/50";
  const variantClass = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-3 w-full"
  }[variant];

  return <div className={`${baseClass} ${variantClass} ${className}`}></div>;
};

export default Skeleton;
