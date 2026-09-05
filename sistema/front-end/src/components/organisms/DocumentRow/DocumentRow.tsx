import React, { useRef } from 'react';

export interface Document {
  id: string;
  name: string;
  status: 'aprovado' | 'reprovado' | 'pendente' | 'enviado';
}

interface DocumentRowProps {
  document: Document;
  onUpload?: (docId: string, file: File) => void;
  isAdvisor?: boolean;
  onViewDocument?: (doc: Document) => void;
  isStageActive?: boolean;
}

const UploadIcon: React.FC = () => (
  <svg 
    className="upload-icon" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ViewIcon: React.FC = () => (
  <svg 
    className="view-icon" 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  onUpload,
  isAdvisor = false,
  onViewDocument,
  isStageActive = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canUpload = document.status === 'pendente' || document.status === 'reprovado';
  const label = document.status.charAt(0).toUpperCase() + document.status.slice(1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload?.(document.id, file);
    }
    event.target.value = '';
  };

  return (
    <div className="document-row">
      <div className="document-info">
        <span className="document-bullet" />
        <span className="document-name">{document.name}</span>
        <span className={`document-badge badge-${document.status}`}>{label}</span>

        {!isAdvisor && canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={handleFileChange}
            />
            <button
              className="document-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label={`Enviar documento para ${document.name}`}
            >
              Enviar documento <UploadIcon />
            </button>
          </>
        )}

        {isAdvisor && isStageActive && (
          <button
            className="document-view-btn"
            onClick={() => onViewDocument?.(document)}
            aria-label={`Visualizar ${document.name}`}
          >
            Ver documento <ViewIcon />
          </button>
        )}
      </div>
    </div>
  );
};

