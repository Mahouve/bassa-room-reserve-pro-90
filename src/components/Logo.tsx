
import React from 'react';

// Logo component for PERENCO
const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/f2119062-1567-4f24-818b-a8b2606bcf05.png" 
        alt="PERENCO Logo" 
        className="h-8" 
      />
    </div>
  );
};

export default Logo;
