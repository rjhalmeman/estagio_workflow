import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  studentName: string;
  onBack?: () => void;
  showBack?: boolean;
}

const BackIcon: React.FC = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ title, studentName, onBack, showBack = true }) => {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <img src="/logo/image 7.png" alt="UTFPR" className="app-header-logo" />
        {title && <div className="app-header-divider" />}
        {title && (
          showBack && onBack ? (
            <button className="app-header-back-group" onClick={onBack} aria-label="Voltar">
              <span className="app-header-back-icon">
                <BackIcon />
              </span>
              <span className="app-header-title">{title}</span>
            </button>
          ) : (
            <div className="app-header-title-only">
              <span className="app-header-title">{title}</span>
            </div>
          )
        )}
      </div>
      
      <div className="app-header-right">
        <span className="app-header-username">{studentName}</span>
      </div>
    </header>
  );
};

export default Header;
