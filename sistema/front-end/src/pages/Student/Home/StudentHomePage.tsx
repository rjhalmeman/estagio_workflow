import React from 'react';
import { Button } from '../../../components/atoms/Button/Button';
import type { AuthUser } from '../../../services/api';
import './StudentHomePage.css';

interface StudentHomePageProps {
  user: AuthUser;
  onSelectOption: (option: 'acompanhar' | 'cadastrar') => void;
  onLogout: () => void;
}

export const StudentHomePage: React.FC<StudentHomePageProps> = ({ 
  user, 
  onSelectOption, 
  onLogout 
}) => {
  return (
    <div className="selection-container-page theme-light">
      <div className="selection-card">
        <div className="selection-user-info">
          <h2>Olá <span className="bold-name">{user.nome}</span></h2>
          <p>Aluno Estagiário</p>
        </div>
        
        <div className="selection-header">
          <h3>Selecione</h3>
          <p>Selecione uma das opções abaixo</p>
        </div>
        <hr className="selection-divider" />
        
        <div className="selection-options">
          <Button
            variant="primary"
            onClick={() => onSelectOption('acompanhar')}
            className="selection-btn"
          >
            Acompanhar estágio
          </Button>

          <Button
            variant="primary"
            onClick={() => onSelectOption('cadastrar')}
            className="selection-btn"
          >
            Cadastrar estágio
          </Button>
        </div>

        <div className="selection-footer">
          <button onClick={onLogout} className="selection-logout-btn">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;
