import React from 'react';
import './StudentInfoBox.css';

interface StudentInfoBoxProps {
  name: string;
  company: string;
  currentStage: number;
  advisorName?: string;
}

export const StudentInfoBox: React.FC<StudentInfoBoxProps> = ({
  name,
  company,
  currentStage,
  advisorName,
}) => {
  return (
    <div className="student-info-container">
      <div className="student-info-box">
        <h2 className="student-name">{name}</h2>
        <p className="student-detail">Empresa: {company}</p>
        <p className="student-detail">Etapa atual: {currentStage}</p>
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
    </div>
  );
};

export default StudentInfoBox;
