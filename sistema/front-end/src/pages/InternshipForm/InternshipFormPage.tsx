import React, { useEffect, useState } from 'react';
import { Header } from '../../components/organisms/Header/Header';
import { StudentDataSection } from './components/StudentDataSection';
import { ScheduleSection } from './components/ScheduleSection';
import { CompanyDataSection } from './components/CompanyDataSection';
import { ProfessorDataSection } from './components/ProfessorDataSection';
import { FormFooter } from './components/FormFooter';
import type { InternshipFormData, InternshipSchedule, ScheduleDay } from '../../types/internship';
import { initialFormData } from '../../types/internship';
import { validateStudent, validateSchedule, validateCompany } from '../../utils/validation';
import {
  getCatalogOptions,
  getCurrentProfile,
  registerInternship,
  type AuthUser,
  type CatalogOptions,
  type UserProfileDetails,
} from '../../services/api';
import './InternshipFormPage.css';

interface InternshipFormPageProps {
  readonly user: AuthUser;
  readonly onBack: () => void;
}

function applyProfileToForm(
  prev: InternshipFormData,
  profile: UserProfileDetails
): InternshipFormData {
  return {
    ...prev,
    studentName: prev.studentName || profile.nome,
    email: prev.email || profile.email,
    phone: prev.phone || profile.telefone || '',
    cellphone: prev.cellphone || profile.celular || '',
    matricula: prev.matricula || profile.aluno?.ra || '',
    courseName: prev.courseName || profile.aluno?.curso.nome || '',
    periodo: prev.periodo || (profile.aluno?.periodo ? String(profile.aluno.periodo) : ''),
    ano: prev.ano || (profile.aluno?.ano ? String(profile.aluno.ano) : ''),
  };
}

function applyCatalogAutofill(
  next: InternshipFormData,
  field: keyof InternshipFormData,
  value: InternshipFormData[keyof InternshipFormData],
  catalog: CatalogOptions | null
): InternshipFormData {
  if (!catalog || typeof value !== 'string') return next;

  if (field === 'companyName') {
    const match = catalog.companies.find((c) => c.nome.toLowerCase() === value.toLowerCase());
    if (match) {
      next.city = next.city || match.cidade.nome;
      next.companyPhone = next.companyPhone || match.telefone || '';
    }
  } else if (field === 'professorName') {
    const match = catalog.advisors.find((a) => a.pessoa.nome.toLowerCase() === value.toLowerCase());
    if (match) {
      next.department = next.department || match.departamento || '';
      next.professorEmail = next.professorEmail || match.pessoa.email;
      next.ramal = next.ramal || match.pessoa.telefone || '';
    }
  }
  return next;
}

const useFormDataState = () => {
  const [formData, setFormData] = useState<InternshipFormData>(initialFormData);
  const [catalog, setCatalog] = useState<CatalogOptions | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCurrentProfile(), getCatalogOptions()])
      .then(([profile, catalogData]) => {
        if (cancelled) return;
        setCatalog(catalogData);
        setFormData((prev) => applyProfileToForm(prev, profile));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleFieldChange = <K extends keyof InternshipFormData>(
    field: K,
    value: InternshipFormData[K]
  ): void => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      return applyCatalogAutofill(next, field, value, catalog);
    });
  };

  const handleScheduleChange = (
    day: keyof InternshipSchedule,
    field: keyof ScheduleDay,
    value: string
  ): void => {
    setFormData((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], [field]: value },
      },
    }));
  };

  return { formData, catalog, handleFieldChange, handleScheduleChange };
};

export const InternshipFormPage: React.FC<InternshipFormPageProps> = ({ user, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const dataState = useFormDataState();

  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const allErrors = {
      ...validateStudent(dataState.formData),
      ...validateSchedule(dataState.formData.schedule),
      ...validateCompany(dataState.formData),
    };
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) return;

    setLoading(true);
    try {
      await registerInternship(dataState.formData);
      showToast('Cadastro de estágio salvo com sucesso!', 'success');
      setTimeout(() => onBack(), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar estágio.';
      const apiErrors: Record<string, string> = {};
      if (msg.includes('matrícula') || msg.includes('RA')) apiErrors.matricula = msg;
      else if (msg.includes('professor')) apiErrors.professorEmail = msg;
      else if (msg.includes('CPF') || msg.includes('e-mail')) apiErrors.email = msg;
      else if (msg.includes('CNPJ') || msg.includes('Empresa')) apiErrors.companyName = msg;
      else showToast(msg, 'error');
      setErrors(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="internship-form-page">
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
          errors={errors}
        />
        <FormFooter onBack={onBack} isLoading={loading} />
      </form>
      <datalist id="courses-catalog">
        {dataState.catalog?.courses.map((c) => <option key={c.id_curso} value={c.nome} />)}
      </datalist>
      <datalist id="cities-catalog">
        {dataState.catalog?.cities.map((c) => <option key={c.id_cidade} value={c.nome} />)}
      </datalist>
      <datalist id="companies-catalog">
        {dataState.catalog?.companies.map((c) => <option key={c.cnpj} value={c.nome} />)}
      </datalist>
      <datalist id="advisors-catalog">
        {dataState.catalog?.advisors.map((a) => <option key={a.cpf} value={a.pessoa.nome} />)}
      </datalist>
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
