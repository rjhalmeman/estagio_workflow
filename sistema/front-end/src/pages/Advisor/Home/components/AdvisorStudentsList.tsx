import React, { useEffect, useState } from 'react';
import { getAdvisorStudents } from '../../../../services/api';
import { toStudentListItem, type StudentListItem } from '../../../../utils/advisorStudents';
import './AdvisorStudentsList.css';

export type { StudentListItem };

interface AdvisorStudentsListProps {
  readonly advisorCpf: string;
  readonly onSelectStudent: (student: StudentListItem) => void;
}

export const AdvisorStudentsList: React.FC<AdvisorStudentsListProps> = ({
  advisorCpf,
  onSelectStudent,
}) => {
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
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Erro ao carregar alunos orientados.');
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
              <span className="student-card-pending">Docs. pendentes: {student.pendingDocs}</span>
            )}
          </div>
          <span className="material-icons student-arrow-icon">north_east</span>
        </button>
      ))}
    </div>
  );
};

export default AdvisorStudentsList;
