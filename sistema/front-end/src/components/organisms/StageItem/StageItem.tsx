import React from 'react';
import { DocumentRow } from '../DocumentRow/DocumentRow';
import type { Document } from '../DocumentRow/DocumentRow';

interface StageItemProps {
  number: number;
  title: string;
  date: string;
  isActive?: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  documents?: Document[];
  onUpload?: (docId: string, file: File) => void;
  isAdvisor?: boolean;
  onViewDocument?: (doc: Document) => void;
}

const ChevronIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg 
    className={`chevron-icon ${isExpanded ? 'expanded' : ''}`} 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const StageCounters: React.FC<{ documents: Document[] }> = ({ documents }) => {
  const approvedCount = documents.filter(d => d.status === 'aprovado' || d.status === 'enviado').length;
  const rejectedCount = documents.filter(d => d.status === 'reprovado').length;

  return (
    <div className="stage-counters">
      {approvedCount > 0 && <span className="counter-badge counter-approved">{approvedCount}</span>}
      {rejectedCount > 0 && <span className="counter-badge counter-rejected">{rejectedCount}</span>}
    </div>
  );
};

interface StageHeaderProps {
  number: number;
  title: string;
  date: string;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  showCounters: boolean;
  documents: Document[];
}

const StageHeader: React.FC<StageHeaderProps> = ({
  number,
  title,
  date,
  isActive,
  isExpanded,
  onToggle,
  showCounters,
  documents,
}) => (
  <button 
    className={`stage-header-bar ${isActive ? 'active-bar' : ''}`} 
    onClick={onToggle}
    aria-expanded={isExpanded}
  >
    <div className="stage-header-left">
      <ChevronIcon isExpanded={isExpanded} />
      <span className="stage-header-date">{date}</span>
      <span className="stage-header-arrow">&rarr;</span>
      <span className="stage-header-title">Etapa {number} &rarr; {title}</span>
    </div>
    {showCounters && <StageCounters documents={documents} />}
  </button>
);

export const StageItem: React.FC<StageItemProps> = ({
  number,
  title,
  date,
  isActive = false,
  isExpanded,
  onToggle,
  documents = [],
  onUpload,
  isAdvisor = false,
  onViewDocument,
}) => {
  const showCounters = !isExpanded && documents.length > 0;

  return (
    <div className={`stage-item-container ${isActive ? 'stage-active' : ''}`}>
      {isActive && <div className="stage-current-tag">Etapa atual</div>}
      
      <StageHeader
        number={number}
        title={title}
        date={date}
        isActive={isActive}
        isExpanded={isExpanded}
        onToggle={onToggle}
        showCounters={showCounters}
        documents={documents}
      />

      {isExpanded && documents.length > 0 && (
        <div className="stage-documents-container">
          {documents.map((doc) => (
            <DocumentRow 
              key={doc.id} 
              document={doc} 
              onUpload={onUpload} 
              isAdvisor={isAdvisor}
              isStageActive={isActive}
              onViewDocument={onViewDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
};
