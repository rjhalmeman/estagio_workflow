import React from 'react';
import { Button } from '../../../components/atoms/Button/Button';

interface FormFooterProps {
  onBack: () => void;
  isLoading?: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  onBack,
  isLoading,
}) => {
  return (
    <footer className="form-footer-container">
      <div className="form-footer-content">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          className="form-footer-back-btn"
        >
          Voltar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="form-footer-submit-btn"
        >
          Salvar e continuar
        </Button>
      </div>
    </footer>
  );
};
