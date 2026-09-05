import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { getAdvisorStudents, setStudentAdvisor } from '../../../services/api';
import type { AuthUser } from '../../../services/api';
import { toStudentListItem, type StudentListItem } from '../../../utils/advisorStudents';
import './PraeAdvisorStudentsPage.css';

interface Advisor {
  id: string;
  name: string;
}

interface PraeAdvisorStudentsPageProps {
  user: AuthUser;
  advisor: Advisor;
  onBack: () => void;
  onSelectStudent: (student: { cpf: string; name: string; company: string }) => void;
  onSelectOption: (option: 'acompanhar' | 'cadastrar' | 'adicionar-alunos') => void;
  onNavigateToAdd: () => void;
}

const UnlinkIcon: React.FC = () => (
  <svg
    className="prae-icon-unlink"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M17 11h-3.58l1.79 1.79c.92-.09 1.79-.53 2.5-1.2l3-3a4.996 4.996 0 0 0-7.07-7.07l-1.72 1.71c.54.91.87 1.94.99 3.02L17 5.03c1.17-1.17 3.07-1.17 4.24 0 1.17 1.17 1.17 3.07 0 4.24l-3 3c-.34.33-.76.57-1.24.73zM2 4.27l2.28 2.28c-.28.48-.48 1.01-.58 1.57l-1.71 1.71c-1.95 1.95-1.95 5.12 0 7.07 1.95 1.95 5.12 1.95 7.07 0l3-3c1.07-1.07 1.57-2.5 1.5-3.9l1.72 1.72c-.08.76-.32 1.5-.73 2.18l2.28 2.28 1.41-1.41L3.41 2.86 2 4.27zM9.57 15.28c-1.17 1.17-3.07 1.17-4.24 0-1.17-1.17-1.17-3.07 0-4.24l1.72-1.72 4.24 4.24-1.72 1.72z" />
  </svg>
);

const ArrowIcon: React.FC = () => (
  <svg
    className="prae-icon-arrow"
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

export const PraeAdvisorStudentsPage: React.FC<PraeAdvisorStudentsPageProps> = ({
  user,
  advisor,
  onBack,
  onSelectStudent,
  onSelectOption,
  onNavigateToAdd,
}) => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAdvisorStudents(advisor.id)
      .then((data) => {
        if (!cancelled) setStudents(data.map(toStudentListItem));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar alunos orientados.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [advisor.id]);

  const handleUnlink = async (student: StudentListItem) => {
    const confirmUnlink = window.confirm(`Deseja desvincular o aluno ${student.name}?`);
    if (!confirmUnlink) return;

    try {
      await setStudentAdvisor(student.cpf, null);
      setStudents((prev) => prev.filter((s) => s.cpf !== student.cpf));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desvincular aluno.');
    }
  };

  const handleNavigateToTracking = (student: StudentListItem) => {
    onSelectStudent({ cpf: student.cpf, name: student.name, company: student.company });
    onSelectOption('acompanhar');
  };

  return (
    <div className="prae-students-page theme-light">
      <Header title={advisor.name} studentName={user.nome} onBack={onBack} />

      <main className="prae-students-body no-scrollbar">
        <div className="prae-students-card">
          <div className="prae-students-header">
            <h3>Alunos orientados</h3>
            <p>Visualize seus alunos orientados</p>
          </div>

          <hr className="prae-students-divider" />

          <div className="prae-students-list">
            {error && <div className="prae-students-empty">{error}</div>}

            {loading && !error && <div className="prae-students-empty">Carregando...</div>}

            {!loading && !error && students.map((student) => (
              <div key={student.id} className="prae-student-row">
                <div className="prae-student-info">
                  <span className="prae-student-name">{student.name}</span>
                  <span className="prae-student-company">Empresa: {student.company}</span>
                  {student.pendingDocs !== undefined && (
                    <span className="prae-student-pending">
                      Docs. pendentes: {student.pendingDocs}
                    </span>
                  )}
                </div>

                <div className="prae-student-actions">
                  <button
                    className="prae-action-btn unlink-btn"
                    onClick={() => handleUnlink(student)}
                    aria-label={`Desvincular ${student.name}`}
                  >
                    <UnlinkIcon />
                  </button>
                  <button
                    className="prae-action-btn track-btn"
                    onClick={() => handleNavigateToTracking(student)}
                    aria-label={`Acompanhar estágio de ${student.name}`}
                  >
                    <ArrowIcon />
                  </button>
                </div>
              </div>
            ))}
            {!loading && !error && students.length === 0 && (
              <div className="prae-students-empty">Nenhum aluno vinculado.</div>
            )}
          </div>

          <button className="prae-add-student-btn" onClick={onNavigateToAdd}>
            Adicionar aluno
          </button>
        </div>
      </main>
    </div>
  );
};

export default PraeAdvisorStudentsPage;
