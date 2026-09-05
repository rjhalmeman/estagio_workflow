import React from 'react';
import { Input } from '../../../components/atoms/Input/Input';
import { Select } from '../../../components/atoms/Select/Select';
import type { InternshipFormData } from '../../../types/internship';
import { maskPhone } from '../../../utils/masks';

interface StudentDataSectionProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
  errors: Record<string, string>;
}

interface HeaderProps {
  icon: string;
  title: string;
  subtitle: string;
}

export const SectionHeader: React.FC<HeaderProps> = ({ icon, title, subtitle }) => (
  <div className="section-title-wrapper">
    <span className="section-icon material-icons">{icon}</span>
    <div>
      <h4>{title}</h4>
      <p className="section-subtitle">{subtitle}</p>
    </div>
  </div>
);

interface SelectorProps {
  value: string;
  error?: string;
  onChange: (val: 'obrigatorio' | 'nao_obrigatorio') => void;
}

export const StageTypeSelector: React.FC<SelectorProps> = ({ value, error, onChange }) => (
  <div className="checkbox-group-container">
    <label className="checkbox-group-label">Selecione seu tipo de estágio</label>
    <div className="checkbox-options-row">
      <label className="custom-radio-label">
        <input
          type="radio"
          name="stageType"
          checked={value === 'obrigatorio'}
          onChange={() => onChange('obrigatorio')}
          className="custom-radio-input"
        />
        <span>Obrigatório</span>
      </label>
      <label className="custom-radio-label">
        <input
          type="radio"
          name="stageType"
          checked={value === 'nao_obrigatorio'}
          onChange={() => onChange('nao_obrigatorio')}
          className="custom-radio-input"
        />
        <span>Não Obrigatório</span>
      </label>
    </div>
    {error && <span className="input-error">{error}</span>}
  </div>
);

interface MainFieldsProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
  errors: Record<string, string>;
}

export const StudentMainFields: React.FC<MainFieldsProps> = ({ data, onChange, errors }) => {
  const periodOptions = [
    { value: '', label: 'Selecione' },
    { value: '1', label: '1º Período' },
    { value: '2', label: '2º Período' },
    { value: '3', label: '3º Período' },
    { value: '4', label: '4º Período' },
    { value: '5', label: '5º Período' },
    { value: '6', label: '6º Período' },
    { value: '7', label: '7º Período' },
    { value: '8', label: '8º Período' },
    { value: '9', label: '9º Período' },
    { value: '10', label: '10º Período' },
  ];
  return (
    <div className="form-fields-grid-5">
      <Input
        label="Nome do aluno*"
        placeholder="Insira seu nome"
        value={data.studentName}
        onChange={(e) => onChange('studentName', e.target.value)}
        maxLength={100}
        error={errors.studentName}
        required
      />
      <Input
        label="Nº de matrícula*"
        placeholder="ex: 1234567"
        value={data.matricula}
        onChange={(e) => onChange('matricula', e.target.value.replace(/\D/g, ''))}
        maxLength={20}
        error={errors.matricula}
        required
      />
      <Input
        label="Nome do curso*"
        placeholder="Insira o nome do seu curso"
        value={data.courseName}
        onChange={(e) => onChange('courseName', e.target.value)}
        maxLength={100}
        error={errors.courseName}
        required
      />
      <Select
        label="Período*"
        options={periodOptions}
        value={data.periodo}
        onChange={(e) => onChange('periodo', e.target.value)}
        error={errors.periodo}
        required
      />
      <Input
        label="Ano"
        placeholder="ex: 2026"
        value={data.ano}
        onChange={(e) => onChange('ano', e.target.value.replace(/\D/g, ''))}
        maxLength={4}
        error={errors.ano}
      />
    </div>
  );
};

interface ContactFieldsProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
  errors: Record<string, string>;
}

export const StudentContactFields: React.FC<ContactFieldsProps> = ({ data, onChange, errors }) => {
  return (
    <div className="form-fields-grid-3">
      <Input
        label="E-mail*"
        type="email"
        placeholder="ex: al1234567"
        value={data.email}
        onChange={(e) => onChange('email', e.target.value)}
        maxLength={100}
        error={errors.email}
        required
      />
      <Input
        label="Fone*"
        placeholder="(XX) XXXX-XXXX"
        value={data.phone}
        onChange={(e) => onChange('phone', maskPhone(e.target.value))}
        maxLength={15}
        error={errors.phone}
        required
      />
      <Input
        label="Celular"
        placeholder="(XX) XXXXX-XXXX"
        value={data.cellphone}
        onChange={(e) => onChange('cellphone', maskPhone(e.target.value))}
        maxLength={15}
        error={errors.cellphone}
      />
    </div>
  );
};

export const StudentDataSection: React.FC<StudentDataSectionProps> = ({ data, onChange, errors }) => {
  return (
    <section className="form-section">
      <SectionHeader icon="school" title="Dados do aluno" subtitle="Preencha os dados abaixo" />
      <StageTypeSelector value={data.stageType} error={errors.stageType} onChange={(val) => onChange('stageType', val)} />
      <StudentMainFields data={data} onChange={onChange} errors={errors} />
      <StudentContactFields data={data} onChange={onChange} errors={errors} />
    </section>
  );
};
