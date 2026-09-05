import React, { useState } from 'react';
import { Header } from '../../components/organisms/Header/Header';
import { StudentDataSection } from './components/StudentDataSection';
import { ScheduleSection } from './components/ScheduleSection';
import { CompanyDataSection } from './components/CompanyDataSection';
import { ProfessorDataSection } from './components/ProfessorDataSection';
import { FormFooter } from './components/FormFooter';
import type { InternshipFormData, InternshipSchedule, ScheduleDay } from '../../types/internship';
import { initialFormData } from '../../types/internship';
import { validateStudent, validateSchedule, validateCompany } from '../../utils/validation';
import { registerInternship } from '../../services/api';
import type { AuthUser } from '../../services/api';
import './InternshipFormPage.css';

interface InternshipFormPageProps {
  user: AuthUser;
  onBack: () => void;
}

const useFormDataState = () => {
  const [formData, setFormData] = useState<InternshipFormData>(initialFormData);

  const handleFieldChange = <K extends keyof InternshipFormData>(field: K, value: InternshipFormData[K]) => {
    setFormData((prev) => {
      const next = { ...prev };
      next[field] = value;
      return next;
    });
  };

  const handleScheduleChange = (
    day: keyof InternshipSchedule,
    field: keyof ScheduleDay,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], [field]: value },
      },
    }));
  };

  return { formData, handleFieldChange, handleScheduleChange };
};

export const InternshipFormPage: React.FC<InternshipFormPageProps> = ({ user, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dataState = useFormDataState();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const studentErrs = validateStudent(dataState.formData);
    const scheduleErrs = validateSchedule(dataState.formData.schedule);
    const companyErrs = validateCompany(dataState.formData);

    const allErrors = { ...studentErrs, ...scheduleErrs, ...companyErrs };
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      setLoading(true);
      try {
        await registerInternship(dataState.formData);
        showToast('Cadastro de estágio salvo com sucesso!', 'success');
        setTimeout(() => onBack(), 1500);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erro ao cadastrar estágio.';
        const apiErrors: Record<string, string> = {};
        
        if (msg.includes('matrícula') || msg.includes('RA')) apiErrors.matricula = msg;
        else if (msg.includes('CPF') || msg.includes('e-mail')) apiErrors.email = msg;
        else if (msg.includes('CNPJ') || msg.includes('Empresa')) apiErrors.companyName = msg;
        else showToast(msg, 'error');

        setErrors(apiErrors);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="internship-form-page theme-light">
      <Header title="Cadastro de estágio" studentName={user.nome} onBack={onBack} />
      <form onSubmit={handleSubmit} className="internship-form-body">
        <StudentDataSection
          data={dataState.formData}
          onChange={dataState.handleFieldChange}
          errors={errors}
        />
        <ScheduleSection
          schedule={dataState.formData.schedule}
          onChange={dataState.handleScheduleChange}
          errors={errors}
        />
        <CompanyDataSection
          data={dataState.formData}
          onChange={dataState.handleFieldChange}
          errors={errors}
        />
        <ProfessorDataSection
          data={dataState.formData}
          onChange={dataState.handleFieldChange}
        />
        <FormFooter onBack={onBack} isLoading={loading} />
      </form>
      {toast && (
        <div className={`form-toast toast-${toast.type}`} role="alert">
          <span className="material-icons toast-icon">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default InternshipFormPage;
