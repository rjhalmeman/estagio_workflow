import React from 'react';
import { Input } from '../../../components/atoms/Input/Input';
import { SectionHeader } from './StudentDataSection';
import type { InternshipFormData } from '../../../types/internship';
import { maskPhone } from '../../../utils/masks';

interface CompanyDataSectionProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
  errors: Record<string, string>;
}

interface RowProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
  errors: Record<string, string>;
}

export const CompanyRow1: React.FC<RowProps> = ({ data, onChange, errors }) => (
  <div className="form-fields-grid-4">
    <Input
      label="Nome da Empresa*"
      placeholder="Insira o nome da Empresa"
      value={data.companyName}
      onChange={(e) => onChange('companyName', e.target.value)}
      maxLength={100}
      error={errors.companyName}
      required
    />
    <Input
      label="Cidade*"
      placeholder="Insira o nome da cidade"
      value={data.city}
      onChange={(e) => onChange('city', e.target.value)}
      maxLength={100}
      error={errors.city}
      required
    />
    <Input
      label="Cargo*"
      placeholder="Insira aqui"
      value={data.role}
      onChange={(e) => onChange('role', e.target.value)}
      maxLength={100}
      error={errors.role}
      required
    />
    <Input
      label="Setor"
      placeholder="Insira aqui"
      value={data.sector}
      onChange={(e) => onChange('sector', e.target.value)}
      maxLength={100}
      error={errors.sector}
    />
  </div>
);

export const CompanyRow2: React.FC<RowProps> = ({ data, onChange, errors }) => (
  <div className="form-fields-grid-3-wide-first">
    <Input
      label="Nome do Supervisor*"
      placeholder="Insira o nome do supervisor"
      value={data.supervisorName}
      onChange={(e) => onChange('supervisorName', e.target.value)}
      maxLength={100}
      error={errors.supervisorName}
      required
    />
    <Input
      label="Início*"
      type="date"
      value={data.startDate}
      onChange={(e) => onChange('startDate', e.target.value)}
      error={errors.startDate}
      required
    />
    <Input
      label="Término"
      type="date"
      value={data.endDate}
      onChange={(e) => onChange('endDate', e.target.value)}
      error={errors.endDate}
    />
  </div>
);

export const CompanyRow3: React.FC<RowProps> = ({ data, onChange, errors }) => (
  <div className="form-fields-grid-3">
    <Input
      label="Fone*"
      placeholder="(XX) XXXX-XXXX"
      value={data.companyPhone}
      onChange={(e) => onChange('companyPhone', maskPhone(e.target.value))}
      maxLength={15}
      error={errors.companyPhone}
      required
    />
    <Input
      label="Celular"
      placeholder="(XX) XXXXX-XXXX"
      value={data.companyCellphone}
      onChange={(e) => onChange('companyCellphone', maskPhone(e.target.value))}
      maxLength={15}
      error={errors.companyCellphone}
    />
    <Input
      label="E-mail*"
      type="email"
      placeholder="ex: empresa@dominio.com"
      value={data.companyEmail}
      onChange={(e) => onChange('companyEmail', e.target.value)}
      maxLength={100}
      error={errors.companyEmail}
      required
    />
  </div>
);

export const CompanyRow4: React.FC<RowProps> = ({ data, onChange, errors }) => (
  <div className="form-fields-grid-2">
    <Input
      label="Carga Horária*"
      placeholder="Insira aqui"
      value={data.weeklyHours}
      onChange={(e) => onChange('weeklyHours', e.target.value.replace(/\D/g, ''))}
      maxLength={10}
      error={errors.weeklyHours}
      required
    />
    <Input
      label="Carga Horária Total*"
      placeholder="Insira aqui"
      value={data.totalHours}
      onChange={(e) => onChange('totalHours', e.target.value.replace(/\D/g, ''))}
      maxLength={10}
      error={errors.totalHours}
      required
    />
  </div>
);

export const CompanyDataSection: React.FC<CompanyDataSectionProps> = ({ data, onChange, errors }) => {
  return (
    <section className="form-section">
      <SectionHeader icon="business" title="Dados da empresa" subtitle="Preencha os dados abaixo" />
      <CompanyRow1 data={data} onChange={onChange} errors={errors} />
      <CompanyRow2 data={data} onChange={onChange} errors={errors} />
      <CompanyRow3 data={data} onChange={onChange} errors={errors} />
      <CompanyRow4 data={data} onChange={onChange} errors={errors} />
    </section>
  );
};
