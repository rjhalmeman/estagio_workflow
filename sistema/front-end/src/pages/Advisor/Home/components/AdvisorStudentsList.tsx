import React, { useEffect, useState } from 'react';
import { getAdvisorStudents } from '../../../../services/api';
import { toStudentListItem, type StudentListItem } from '../../../../utils/advisorStudents';
import './AdvisorStudentsList.css';

export type { StudentListItem };

interface AdvisorStudentsListProps {
  advisorCpf: string;
  onSelectStudent: (student: StudentListItem) => void;
}

const ArrowIcon: React.FC = () => (
  <svg
    className="student-arrow-icon"
    width="18"
    height="18"
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

export const AdvisorStudentsList: React.FC<AdvisorStudentsListProps> = ({ advisorCpf, onSelectStudent }) => {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAdvisorStudents(advisorCpf)
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
  }, [advisorCpf]);

  if (loading) {
    return <div className="advisor-students-list-state">Carregando...</div>;
  }

  if (error) {
    return <div className="advisor-students-list-state">{error}</div>;
  }

  if (students.length === 0) {
    return <div className="advisor-students-list-state">Nenhum aluno orientado no momento.</div>;
  }

  return (
    <div className="advisor-students-list">
      {students.map((student) => (
        <button
          key={student.id}
          className="student-card-btn"
          onClick={() => onSelectStudent(student)}
          aria-label={`Acompanhar estágio de ${student.name}`}
        >
          <div className="student-card-info">
            <span className="student-card-name">{student.name}</span>
            <span className="student-card-company">Empresa: {student.company}</span>
            {student.pendingDocs !== undefined && (
              <span className="student-card-pending">
                Docs. pendentes: {student.pendingDocs}
              </span>
            )}
          </div>
          <ArrowIcon />
        </button>
      ))}
    </div>
  );
};

export default AdvisorStudentsList;
