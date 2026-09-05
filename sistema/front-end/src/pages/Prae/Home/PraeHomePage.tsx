import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { getAdvisors, getUnassignedStudents } from '../../../services/api';
import type { AdvisorSummary, AuthUser, UnassignedStudent } from '../../../services/api';
import './PraeHomePage.css';

interface PraeHomePageProps {
  user: AuthUser;
  onLogout: () => void;
  onSelectOption: (option: 'acompanhar' | 'cadastrar') => void;
  onSelectAdvisor?: (advisor: { id: string; name: string }) => void;
  onSelectStudent?: (student: { cpf: string; name: string; company: string }) => void;
}

interface ListItem {
  id: string;
  name: string;
  subtitle: string;
}

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

function toAdvisorItem(advisor: AdvisorSummary): ListItem {
  const count = advisor._count.aluno;
  return {
    id: advisor.cpf,
    name: advisor.pessoa.nome,
    subtitle: `${count} aluno${count === 1 ? '' : 's'} orientado${count === 1 ? '' : 's'}`,
  };
}

function toStudentItem(student: UnassignedStudent): ListItem {
  return { id: student.cpf, name: student.pessoa.nome, subtitle: student.curso.nome };
}

export const PraeHomePage: React.FC<PraeHomePageProps> = ({
  user,
  onLogout,
  onSelectOption,
  onSelectAdvisor,
  onSelectStudent
}) => {
  const [activeTab, setActiveTab] = useState<'professores' | 'estagiarios'>('professores');
  const [searchQuery, setSearchQuery] = useState('');
  const [advisors, setAdvisors] = useState<ListItem[]>([]);
  const [students, setStudents] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAdvisors(), getUnassignedStudents()])
      .then(([advisorsData, studentsData]) => {
        if (cancelled) return;
        setAdvisors(advisorsData.map(toAdvisorItem));
        setStudents(studentsData.map(toStudentItem));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const currentList = activeTab === 'professores' ? advisors : students;

  const filteredList = currentList.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (item: ListItem) => {
    if (activeTab === 'professores') {
      onSelectAdvisor?.({ id: item.id, name: item.name });
    } else {
      onSelectStudent?.({ cpf: item.id, name: item.name, company: '' });
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
            {error && <div className="prae-empty-state">{error}</div>}

            {loading && !error && <div className="prae-empty-state">Carregando...</div>}

            {!loading && !error && filteredList.map((item) => (
              <button
                key={item.id}
                className="prae-list-card"
                onClick={() => handleCardClick(item)}
                aria-label={`Visualizar detalhes de ${item.name}`}
              >
                <div className="prae-card-info">
                  <span className="prae-card-title">{item.name}</span>
                  <span className="prae-card-subtitle">{item.subtitle}</span>
                </div>
                <ArrowIcon />
              </button>
            ))}
            {!loading && !error && filteredList.length === 0 && (
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
