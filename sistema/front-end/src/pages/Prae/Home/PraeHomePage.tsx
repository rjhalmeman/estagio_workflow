import React, { useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import type { AuthUser } from '../../../services/api';
import './PraeHomePage.css';

interface PraeHomePageProps {
  user: AuthUser;
  onLogout: () => void;
  onSelectOption: (option: 'acompanhar' | 'cadastrar') => void;
  onSelectAdvisor?: (advisor: { id: string; name: string }) => void;
  onSelectStudent?: (student: { name: string; company: string }) => void;
}

interface ListItem {
  id: string;
  name: string;
  type: 'professor' | 'estagiario';
}

const mockProfessors: ListItem[] = [
  { id: 'prof-x', name: 'Professor X', type: 'professor' },
  { id: 'prof-y', name: 'Professor Y', type: 'professor' },
  { id: 'prof-z', name: 'Professor Z', type: 'professor' },
];

const mockStudents: ListItem[] = [
  { id: 'est-x', name: 'Estagiário A', type: 'estagiario' },
  { id: 'est-y', name: 'Estagiário B', type: 'estagiario' },
  { id: 'est-z', name: 'Estagiário C', type: 'estagiario' },
];

const ArrowIcon: React.FC = () => (
  <svg 
    className="prae-card-arrow" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export const PraeHomePage: React.FC<PraeHomePageProps> = ({ 
  user, 
  onLogout,
  onSelectOption, 
  onSelectAdvisor, 
  onSelectStudent 
}) => {
  const [activeTab, setActiveTab] = useState<'professores' | 'estagiarios'>('professores');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = activeTab === 'professores' ? mockProfessors : mockStudents;

  const filteredList = currentList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (item: ListItem) => {
    if (activeTab === 'professores') {
      onSelectAdvisor?.({ id: item.id, name: item.name });
    } else {
      const mockCompany = item.name === 'Estagiário B' ? 'Coamo' : 'Appmoove';
      onSelectStudent?.({ name: item.name, company: mockCompany });
      onSelectAdvisor?.({ id: 'prof-x', name: 'Professor X' });
      onSelectOption('acompanhar');
    }
  };

  return (
    <div className="prae-home-page theme-light">
      <Header title="" studentName={user.nome} showBack={false} />

      <main className="prae-home-body no-scrollbar">
        <div className="prae-content-card">
          {/* Abas */}
          <div className="prae-tabs-row">
            <button
              className={`prae-tab-btn ${activeTab === 'professores' ? 'prae-tab-active' : ''}`}
              onClick={() => {
                setActiveTab('professores');
                setSearchQuery('');
              }}
            >
              Prof. Orientadores
            </button>
            <button
              className={`prae-tab-btn ${activeTab === 'estagiarios' ? 'prae-tab-active' : ''}`}
              onClick={() => {
                setActiveTab('estagiarios');
                setSearchQuery('');
              }}
            >
              Estagiários
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="prae-search-section">
            <label className="prae-search-label" htmlFor="prae-search-input">
              Buscar
            </label>
            <input
              id="prae-search-input"
              type="text"
              className="prae-search-input"
              placeholder={activeTab === 'professores' ? "Digite o nome" : "Digite o nome ou RA do aluno"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Listagem */}
          <div className="prae-list-container">
            {filteredList.map((item) => (
              <button
                key={item.id}
                className="prae-list-card"
                onClick={() => handleCardClick(item)}
                aria-label={`Visualizar detalhes de ${item.name}`}
              >
                <span className="prae-card-title">{item.name}</span>
                <ArrowIcon />
              </button>
            ))}
            {filteredList.length === 0 && (
              <div className="prae-empty-state">Nenhum registro encontrado.</div>
            )}
          </div>

          <div className="prae-logout-container">
            <button className="prae-logout-btn" onClick={onLogout}>
              Sair
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PraeHomePage;
