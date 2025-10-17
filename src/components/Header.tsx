import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'fixed';
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ variant = 'default', className = '' }) => {
  return <UnifiedHeader variant={variant} className={className} />;
};

export default Header;