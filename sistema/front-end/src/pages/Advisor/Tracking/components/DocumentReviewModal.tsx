import React, { useEffect, useState } from 'react';
import type { Document } from '../../../../components/organisms/DocumentRow/DocumentRow';
import { downloadDocument } from '../../../../services/api';
import './DocumentReviewModal.css';

interface DocumentReviewModalProps {
  document: Document | null;
  onClose: () => void;
  onApprove: (comentario?: string) => void;
  onReject: (comentario?: string) => void;
}

const RedCloseIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#e03131"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function guessMimeType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}

const DocumentPreview: React.FC<{ doc: Document }> = ({ doc }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('application/octet-stream');
  const [loading, setLoading] = useState(Boolean(doc.realId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc.realId) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    downloadDocument(doc.realId)
      .then((blob) => {
        if (cancelled) return;
        const mime = guessMimeType(doc.name);
        const typedBlob = blob.type === mime ? blob : new Blob([blob], { type: mime });
        objectUrl = URL.createObjectURL(typedBlob);
        setMimeType(mime);
        setPreviewUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar documento.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.realId, doc.name]);

  if (!doc.realId) {
    return <div className="document-viewer-state">Este documento ainda não foi enviado pelo aluno.</div>;
  }

  if (loading) {
    return <div className="document-viewer-state">Carregando documento...</div>;
  }

  if (error || !previewUrl) {
    return <div className="document-viewer-state">{error || 'Não foi possível carregar o documento.'}</div>;
  }

  if (mimeType === 'application/pdf') {
    return <iframe className="document-viewer-frame" src={previewUrl} title={doc.name} />;
  }

  if (mimeType.startsWith('image/')) {
    return <img className="document-viewer-image" src={previewUrl} alt={doc.name} />;
  }

  return (
    <div className="document-viewer-state">
      Pré-visualização não disponível para este tipo de arquivo.
      <a className="document-viewer-download" href={previewUrl} download={doc.name}>
        Baixar documento
      </a>
    </div>
  );
};

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  document,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('');
  const [openDocId, setOpenDocId] = useState<string | null>(null);

  if (document && document.id !== openDocId) {
    setOpenDocId(document.id);
    setComment('');
  }

  if (!document) return null;

  const handleApprove = () => {
    onApprove(comment.trim() || undefined);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    onReject(comment.trim() || undefined);
    setComment('');
    onClose();
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-titles">
            <h3 className="modal-title">Visualização de documento</h3>
            <span className="modal-subtitle">{document.name}</span>
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Fechar modal">
            <RedCloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="document-viewer">
            <DocumentPreview doc={document} />
          </div>

          <div className="comment-section">
            <label className="comment-label" htmlFor="doc-comment">
              Enviar comentário
            </label>
            <textarea
              id="doc-comment"
              className="comment-textarea"
              placeholder="Deixe seu comentário aqui"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn btn-secondary" onClick={handleReject}>
            Solicitar correção
          </button>
          <button className="modal-btn btn-primary" onClick={handleApprove}>
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentReviewModal;
