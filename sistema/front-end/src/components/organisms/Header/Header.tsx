import React from 'react';
import { useAppContext } from '../../../store/AppContext';
import './Header.css';

interface HeaderProps {
  readonly title: string;
  readonly studentName: string;
  readonly onBack?: () => void;
  readonly showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  studentName,
  onBack,
  showBack = true,
}) => {
  const { theme, toggleTheme, systemOnline } = useAppContext();

  return (
    <header className="app-header">
      <div className="app-header-left">
        <img src="/logo/image 7.png" alt="UTFPR" className="app-header-logo" />
        {title && <div className="app-header-divider" />}
        {title &&
          (showBack && onBack ? (
            <button className="app-header-back-group" onClick={onBack} aria-label="Voltar">
              <span className="material-icons app-header-back-icon">arrow_back</span>
              <span className="app-header-title">{title}</span>
            </button>
          ) : (
            <div className="app-header-title-only">
              <span className="app-header-title">{title}</span>
            </div>
          ))}
      </div>

      <div className="app-header-right">
        {systemOnline !== null && (
          <span
            className={`app-header-status ${systemOnline ? 'status-online' : 'status-offline'}`}
            title={systemOnline ? 'Servidor conectado' : 'Servidor indisponível'}
          >
            <span className="material-icons app-header-status-dot">fiber_manual_record</span>
            {systemOnline ? 'Online' : 'Offline'}
          </span>
        )}
        <button
          type="button"
          className="app-header-theme-btn"
          onClick={toggleTheme}
          aria-label="Alternar tema claro ou escuro"
        >
          <span className="material-icons app-header-theme-icon">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
        <div className="app-header-user-pill">
          <span className="material-icons app-header-user-icon">account_circle</span>
          <span className="app-header-username">{studentName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
