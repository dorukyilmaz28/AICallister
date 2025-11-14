"use client";

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Loading: React.FC<LoadingProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src="https://lottie.host/2294d590-0a25-4897-a933-838b57a58664/iDCR7vsSIh.lottie"
        loop
        autoplay
        className={sizeClasses[size]}
      />
    </div>
  );
};

export default Loading;

