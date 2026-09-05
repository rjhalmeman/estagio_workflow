import React from 'react';
import { Input } from '../../../components/atoms/Input/Input';
import { SectionHeader } from './StudentDataSection';
import type { InternshipFormData } from '../../../types/internship';

interface ProfessorDataSectionProps {
  data: InternshipFormData;
  onChange: (field: keyof InternshipFormData, value: string) => void;
}

export const ProfessorDataSection: React.FC<ProfessorDataSectionProps> = ({ data, onChange }) => {
  return (
    <section className="form-section">
      <SectionHeader icon="person" title="Dados do Professor" subtitle="Preencha os dados abaixo" />
      <div className="form-fields-grid-4">
        <Input
          label="Nome do Professor"
          placeholder="Insira o nome do Professor"
          value={data.professorName}
          onChange={(e) => onChange('professorName', e.target.value)}
          maxLength={100}
        />
        <Input
          label="Departamento"
          placeholder="Insira o departamento"
          value={data.department}
          onChange={(e) => onChange('department', e.target.value)}
          maxLength={100}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Insira o email do Professor"
          value={data.professorEmail}
          onChange={(e) => onChange('professorEmail', e.target.value)}
          maxLength={100}
        />
        <Input
          label="Ramal"
          placeholder="ex: 1234"
          value={data.ramal}
          onChange={(e) => onChange('ramal', e.target.value.replace(/\D/g, ''))}
          maxLength={10}
        />
      </div>
    </section>
  );
};
