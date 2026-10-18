import React from 'react';
import './StudentInfoBox.css';

interface StudentInfoBoxProps {
  readonly name: string;
  readonly company: string;
  readonly currentStage: number;
  readonly advisorName?: string;
  readonly approved?: boolean;
  readonly processoSei?: string | null;
  readonly notaApresentacao?: number | string | null;
  readonly canEditAdmin?: boolean;
  readonly onEditAdmin?: () => void;
}

export const StudentInfoBox: React.FC<StudentInfoBoxProps> = ({
  name,
  company,
  currentStage,
  advisorName,
  approved,
  processoSei,
  notaApresentacao,
  canEditAdmin = false,
  onEditAdmin,
}) => {
  return (
    <div className="student-info-container">
      <div className="student-info-box">
        <h2 className="student-name">{name}</h2>
        <p className="student-detail">Empresa: {company || 'Não informada'}</p>
        <p className="student-detail">Etapa atual: {currentStage}</p>
        {approved !== undefined && (
          <p className="student-detail">
            Situação: {approved ? 'Homologado / Aprovado' : 'Em andamento'}
            {processoSei ? ` • SEI: ${processoSei}` : ''}
            {notaApresentacao !== null && notaApresentacao !== undefined
              ? ` • Nota: ${notaApresentacao}`
              : ''}
          </p>
        )}
      </div>

      {advisorName && (
        <>
          <div className="student-info-divider" />
          <div className="advisor-info-box">
            <span className="advisor-info-label">Orientador:</span>
            <span className="advisor-info-name">{advisorName}</span>
          </div>
        </>
      )}

      {canEditAdmin && onEditAdmin && (
        <div className="student-info-actions">
          <button
            type="button"
            className="student-admin-edit-btn"
            onClick={onEditAdmin}
          >
            Editar dados do estágio
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentInfoBox;
