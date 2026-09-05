import React from 'react';
import { AdvisorStudentsList } from './components/AdvisorStudentsList';
import type { StudentListItem } from './components/AdvisorStudentsList';
import type { AuthUser } from '../../../services/api';
import './AdvisorHomePage.css';

interface AdvisorHomePageProps {
  user: AuthUser;
  onSelectOption: (option: 'acompanhar' | 'cadastrar') => void;
  onLogout: () => void;
  onSelectStudent?: (student: { cpf: string; name: string; company: string }) => void;
}

export const AdvisorHomePage: React.FC<AdvisorHomePageProps> = ({ 
  user, 
  onSelectOption, 
  onLogout,
  onSelectStudent
}) => {
  const handleSelectStudent = (student: StudentListItem) => {
    onSelectStudent?.({ cpf: student.cpf, name: student.name, company: student.company });
    onSelectOption('acompanhar');
  };

  return (
    <div className="selection-container-page theme-light">
      <div className="selection-card">
        <div className="selection-user-info">
          <h2>Olá <span className="bold-name">{user.nome}</span></h2>
          <p>Professor Orientador</p>
        </div>
        
        <div className="selection-header">
          <h3>Alunos orientados</h3>
          <p>Visualize seus alunos orientados</p>
        </div>
        <hr className="selection-divider" />
        
        <AdvisorStudentsList advisorCpf={user.cpf} onSelectStudent={handleSelectStudent} />

        <div className="selection-footer">
          <button onClick={onLogout} className="selection-logout-btn">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvisorHomePage;
