import React from 'react';
import { SectionHeader } from './StudentDataSection';
import type { InternshipSchedule, ScheduleDay } from '../../../types/internship';

interface ScheduleDayRowProps {
  label: string;
  dayKey: keyof InternshipSchedule;
  dayData: ScheduleDay;
  onChange: (day: keyof InternshipSchedule, field: keyof ScheduleDay, value: string) => void;
  errors: Record<string, string>;
}

export const ScheduleDayRow: React.FC<ScheduleDayRowProps> = ({
  label,
  dayKey,
  dayData,
  onChange,
  errors,
}) => {
  const err = (field: keyof ScheduleDay) =>
    errors[`${dayKey}.${field}`] ? 'schedule-time-input-error' : '';

  const handleOpenPicker = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch (err) {
      // Fallback para navegadores legados
    }
  };

  return (
    <div className="schedule-day-column">
      <label className="schedule-day-label">{label}</label>
      <div className="schedule-inputs-row">
        <input
          type="time"
          value={dayData.start1}
          onChange={(e) => onChange(dayKey, 'start1', e.target.value)}
          onClick={handleOpenPicker}
          className={`schedule-time-input ${err('start1')}`}
        />
        <span className="schedule-text-connector">Às</span>
        <input
          type="time"
          value={dayData.end1}
          onChange={(e) => onChange(dayKey, 'end1', e.target.value)}
          onClick={handleOpenPicker}
          className={`schedule-time-input ${err('end1')}`}
        />
        <span className="schedule-text-connector">e</span>
        <input
          type="time"
          value={dayData.start2}
          onChange={(e) => onChange(dayKey, 'start2', e.target.value)}
          onClick={handleOpenPicker}
          className={`schedule-time-input ${err('start2')}`}
        />
        <span className="schedule-text-connector">Às</span>
        <input
          type="time"
          value={dayData.end2}
          onChange={(e) => onChange(dayKey, 'end2', e.target.value)}
          onClick={handleOpenPicker}
          className={`schedule-time-input ${err('end2')}`}
        />
      </div>
    </div>
  );
};

interface ScheduleSectionProps {
  schedule: InternshipSchedule;
  onChange: (day: keyof InternshipSchedule, field: keyof ScheduleDay, value: string) => void;
  errors: Record<string, string>;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule, onChange, errors }) => {
  return (
    <section className="form-section">
      <SectionHeader icon="calendar_today" title="Horários do estágio" subtitle="Preencha os dados abaixo" />
      
      <div className="schedule-grid">
        <ScheduleDayRow label="Segunda-feira" dayKey="segunda" dayData={schedule.segunda} onChange={onChange} errors={errors} />
        <ScheduleDayRow label="Terça-feira" dayKey="terca" dayData={schedule.terca} onChange={onChange} errors={errors} />
        <ScheduleDayRow label="Quarta-feira" dayKey="quarta" dayData={schedule.quarta} onChange={onChange} errors={errors} />
        
        <ScheduleDayRow label="Quinta-feira" dayKey="quinta" dayData={schedule.quinta} onChange={onChange} errors={errors} />
        <ScheduleDayRow label="Sexta-feira" dayKey="sexta" dayData={schedule.sexta} onChange={onChange} errors={errors} />
        <ScheduleDayRow label="Sábado" dayKey="sabado" dayData={schedule.sabado} onChange={onChange} errors={errors} />
      </div>
    </section>
  );
};
