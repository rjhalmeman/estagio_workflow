import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { Select } from '../../../components/atoms/Select/Select';
import {
  getAdvisors,
  getAllPraeStudents,
  getCatalogOptions,
  type AdvisorStudentSummary,
  type AdvisorSummary,
  type AuthUser,
  type CourseOption,
} from '../../../services/api';
import './PraeHomePage.css';

interface PraeHomePageProps {
  readonly user: AuthUser;
  readonly onLogout: () => void;
  readonly onSelectOption: (option: 'acompanhar' | 'cadastrar') => void;
  readonly onSelectAdvisor?: (advisor: { id: string; name: string }) => void;
  readonly onSelectStudent?: (student: { cpf: string; name: string; company: string }) => void;
}

interface ListItem {
  readonly id: string;
  readonly name: string;
  readonly ra?: string;
  readonly company?: string;
  readonly subtitle: string;
}

const ArrowIcon: React.FC = () => (
  <span className="material-icons prae-card-arrow">north_east</span>
);

function toAdvisorItem(advisor: AdvisorSummary): ListItem {
  const count = advisor._count.aluno;
  return { id: advisor.cpf, name: advisor.pessoa.nome, subtitle: `${count} aluno${count === 1 ? '' : 's'} orientado${count === 1 ? '' : 's'}` };
}

function toStudentItem(student: AdvisorStudentSummary): ListItem {
  const company = student.estagio[0]?.unidade_concedente.nome ?? '';
  const advisorName = student.professor_orientador?.pessoa.nome;
  const details = [`RA: ${student.ra}`, student.curso.nome, company ? `Empresa: ${company}` : 'Sem estágio ativo', advisorName ? `Orientador: ${advisorName}` : 'Sem orientador'].join(' • ');
  return { id: student.cpf, name: student.pessoa.nome, ra: student.ra, company, subtitle: details };
}

export const PraeHomePage: React.FC<PraeHomePageProps> = ({
  user,
  onLogout,
  onSelectOption,
  onSelectAdvisor,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'professores' | 'estagiarios'>('professores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    user.idCurso ? String(user.idCurso) : ''
  );
  const [courses, setCourses] = useState<readonly CourseOption[]>([]);
  const [advisors, setAdvisors] = useState<ListItem[]>([]);
  const [students, setStudents] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const courseFilter = selectedCourseId ? parseInt(selectedCourseId, 10) : undefined;

    Promise.all([getAdvisors(), getAllPraeStudents(courseFilter), getCatalogOptions()])
      .then(([advisorsData, studentsData, catalogData]) => {
        if (cancelled) return;
        setAdvisors(advisorsData.map(toAdvisorItem));
        setStudents(studentsData.map(toStudentItem));
        setCourses(catalogData.courses);
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
  }, [selectedCourseId]);

  const filteredList = useMemo(() => {
    const list = activeTab === 'professores' ? advisors : students;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(q) || Boolean(item.ra && item.ra.toLowerCase().includes(q))
    );
  }, [activeTab, advisors, students, searchQuery]);

  const courseOptions = useMemo(
    () => [{ value: '', label: 'Todos os cursos' }, ...courses.map((c) => ({ value: String(c.id_curso), label: c.nome }))],
    [courses]
  );

  const handleCardClick = (item: ListItem): void => {
    if (activeTab === 'professores') onSelectAdvisor?.({ id: item.id, name: item.name });
    else {
      onSelectStudent?.({ cpf: item.id, name: item.name, company: item.company ?? '' });
      onSelectOption('acompanhar');
    }
  };

  return (
    <div className="prae-home-page">
      <Header title="" studentName={user.nome} showBack={false} />
      <main className="prae-home-body no-scrollbar">
        <div className="prae-content-card">
          <div className="prae-tabs-row">
            <button
              className={`prae-tab-btn ${activeTab === 'professores' ? 'prae-tab-active' : ''}`}
              onClick={() => { setActiveTab('professores'); setSearchQuery(''); }}
            >
              Prof. Orientadores
            </button>
            <button
              className={`prae-tab-btn ${activeTab === 'estagiarios' ? 'prae-tab-active' : ''}`}
              onClick={() => { setActiveTab('estagiarios'); setSearchQuery(''); }}
            >
              Estagiários
            </button>
          </div>

          <div className="prae-filters-row">
            <div className="prae-search-section">
              <label className="prae-search-label" htmlFor="prae-search-input">Buscar</label>
              <input
                id="prae-search-input"
                type="text"
                className="prae-search-input"
                placeholder={activeTab === 'professores' ? 'Digite o nome' : 'Digite o nome ou RA do aluno'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeTab === 'estagiarios' && (
              <div className="prae-course-filter">
                <Select
                  id="prae-course-select"
                  label="Curso"
                  options={courseOptions}
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                />
              </div>
            )}
          </div>

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
            <button className="prae-logout-btn" onClick={onLogout}>Sair</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PraeHomePage;
