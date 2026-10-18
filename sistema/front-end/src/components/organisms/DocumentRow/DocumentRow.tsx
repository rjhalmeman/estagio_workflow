import React, { useRef } from 'react';

export interface Document {
  readonly id: string;
  readonly realId?: number;
  readonly name: string;
  readonly status: 'aprovado' | 'reprovado' | 'pendente' | 'enviado';
  readonly comentario?: string | null;
}

interface DocumentRowProps {
  readonly document: Document;
  readonly onUpload?: (docId: string, file: File) => void;
  readonly isAdvisor?: boolean;
  readonly onViewDocument?: (doc: Document) => void;
  readonly isStageActive?: boolean;
}

export const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  onUpload,
  isAdvisor = false,
  onViewDocument,
  isStageActive = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canUpload = document.status === 'pendente' || document.status === 'reprovado';
  const canView = isAdvisor && (isStageActive || Boolean(document.realId));
  const label = document.status.charAt(0).toUpperCase() + document.status.slice(1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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
            <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
            <button
              className="document-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label={`Enviar documento para ${document.name}`}
            >
              <span>Enviar documento</span>
              <span className="material-icons upload-icon">upload_file</span>
            </button>
          </>
        )}

        {canView && (
          <button
            className="document-view-btn"
            onClick={() => onViewDocument?.(document)}
            aria-label={`Visualizar ${document.name}`}
          >
            <span>Ver documento</span>
            <span className="material-icons view-icon">visibility</span>
          </button>
        )}
      </div>
      {document.comentario && (
        <p className="document-comment" role="note">
          <span className="material-icons document-comment-icon">chat_bubble_outline</span>
          <span>Observação do orientador: {document.comentario}</span>
        </p>
      )}
    </div>
  );
};
