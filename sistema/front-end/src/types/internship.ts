export interface ScheduleDay {
  start1: string;
  end1: string;
  start2: string;
  end2: string;
}

export interface InternshipSchedule {
  segunda: ScheduleDay;
  terca: ScheduleDay;
  quarta: ScheduleDay;
  quinta: ScheduleDay;
  sexta: ScheduleDay;
  sabado: ScheduleDay;
}

export interface InternshipFormData {
  // Dados do aluno
  stageType: 'obrigatorio' | 'nao_obrigatorio' | '';
  studentName: string;
  matricula: string;
  courseName: string;
  periodo: string;
  ano: string;
  email: string;
  phone: string;
  cellphone: string;

  // Horários do estágio
  schedule: InternshipSchedule;

  // Dados da empresa
  companyName: string;
  city: string;
  role: string;
  sector: string;
  supervisorName: string;
  startDate: string;
  endDate: string;
  companyPhone: string;
  companyCellphone: string;
  companyEmail: string;
  weeklyHours: string;
  totalHours: string;

  // Dados do Professor
  professorName: string;
  department: string;
  professorEmail: string;
  ramal: string;
}

export const initialScheduleDay = (): ScheduleDay => ({
  start1: '',
  end1: '',
  start2: '',
  end2: '',
});

export const initialFormData = (): InternshipFormData => ({
  stageType: '',
  studentName: '',
  matricula: '',
  courseName: '',
  periodo: '',
  ano: '',
  email: '',
  phone: '',
  cellphone: '',
  schedule: {
    segunda: initialScheduleDay(),
    terca: initialScheduleDay(),
    quarta: initialScheduleDay(),
    quinta: initialScheduleDay(),
    sexta: initialScheduleDay(),
    sabado: initialScheduleDay(),
  },
  companyName: '',
  city: '',
  role: '',
  sector: '',
  supervisorName: '',
  startDate: '',
  endDate: '',
  companyPhone: '',
  companyCellphone: '',
  companyEmail: '',
  weeklyHours: '',
  totalHours: '',
  professorName: '',
  department: '',
  professorEmail: '',
  ramal: '',
});
