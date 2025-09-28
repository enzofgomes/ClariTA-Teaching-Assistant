import React, { useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14', 
    lg: 'w-15 h-15',
    xl: 'w-17 h-17'
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    // Fallback: Simple fox emoji or text
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-orange-500 rounded text-white font-bold`}>
        🦊
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="/assets/images/fox-logo.png"
        alt="ClariTA Fox Logo"
        className="w-full h-full object-contain"
        onError={handleImageError}
      />
    </div>
  );
};

export default Logo;
