import React, { useState } from 'react';
import type { Document } from '../../../../components/organisms/DocumentRow/DocumentRow';
import './DocumentReviewModal.css';

interface DocumentReviewModalProps {
  document: Document | null;
  onClose: () => void;
  onApprove: (docId: string) => void;
  onReject: (docId: string) => void;
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

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  document,
  onClose,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('');

  if (!document) return null;

  const handleApprove = () => {
    onApprove(document.id);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    onReject(document.id);
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
          <div className="document-mock-viewer">
            <div className="document-mock-canvas" />
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
