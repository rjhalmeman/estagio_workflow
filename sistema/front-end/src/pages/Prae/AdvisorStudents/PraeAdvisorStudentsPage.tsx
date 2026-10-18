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
  <span className="material-icons prae-icon-unlink">link_off</span>
);

const ArrowIcon: React.FC = () => (
  <span className="material-icons prae-icon-arrow">north_east</span>
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
    <div className="prae-students-page">
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
