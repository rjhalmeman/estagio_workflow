import React from 'react';

interface FormStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const FormStepper: React.FC<FormStepperProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1, label: 'Dados do aluno' },
    { id: 2, label: 'Horários' },
    { id: 3, label: 'Dados da empresa' },
    { id: 4, label: 'Professor' },
  ];

  return (
    <div className="form-stepper-container">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`stepper-step ${currentStep >= step.id ? 'active' : ''} stepper-clickable`}
            onClick={() => onStepClick(step.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onStepClick(step.id)}
          >
            <span className="stepper-bubble">{step.id}</span>
            <span className="stepper-label">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`stepper-line ${currentStep > step.id ? 'active' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FormStepper;
