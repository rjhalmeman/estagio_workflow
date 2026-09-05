import React, { useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { StageItem } from '../../../components/organisms/StageItem/StageItem';
import { StudentInfoBox } from './components/StudentInfoBox';
import { DocumentReviewModal } from './components/DocumentReviewModal';
import type { Document } from '../../../components/organisms/DocumentRow/DocumentRow';
import type { AuthUser } from '../../../services/api';
import './AdvisorTrackingPage.css';

interface SelectedStudent {
  name: string;
  company: string;
}

interface AdvisorTrackingPageProps {
  user: AuthUser;
  selectedStudent: SelectedStudent | null;
  advisorName?: string;
  onBack: () => void;
}

interface Stage {
  number: number;
  title: string;
  date: string;
  isActive?: boolean;
  documents: Document[];
}

const initialStages: Stage[] = [
  {
    number: 1,
    title: 'Plano de estagio',
    date: '--/--/----',
    documents: [
      { id: '1-1', name: 'Documento x', status: 'aprovado' },
      { id: '1-2', name: 'Documento y', status: 'aprovado' },
    ],
  },
  {
    number: 2,
    title: 'Parcial 1',
    date: '--/--/----',
    documents: [
      { id: '2-1', name: 'Documento x', status: 'aprovado' },
      { id: '2-2', name: 'Documento y', status: 'aprovado' },
      { id: '2-3', name: 'Documento z', status: 'reprovado' },
    ],
  },
  {
    number: 3,
    title: 'Parcial 2',
    date: '--/--/----',
    isActive: true,
    documents: [
      { id: '3-1', name: 'Documento x', status: 'aprovado' },
      { id: '3-2', name: 'Documento y', status: 'reprovado' },
    ],
  },
  {
    number: 4,
    title: 'Supervisor',
    date: '--/--/----',
    documents: [],
  },
  {
    number: 5,
    title: 'Visita',
    date: '--/--/----',
    documents: [],
  },
];

export const AdvisorTrackingPage: React.FC<AdvisorTrackingPageProps> = ({ 
  user, 
  selectedStudent, 
  advisorName, 
  onBack 
}) => {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [expanded, setExpanded] = useState<number[]>([1, 3]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const toggleStage = (num: number) => {
    setExpanded((prev) =>
      prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]
    );
  };

  const handleStatusChange = (docId: string, newStatus: 'aprovado' | 'reprovado') => {
    setStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        documents: stage.documents.map((doc) =>
          doc.id === docId ? { ...doc, status: newStatus } : doc
        ),
      }))
    );
  };

  const displayCompany = selectedStudent?.name === 'Aluno X' ? " " : (selectedStudent?.company || " ");
  const headerTitle = user.role === 'professor_prae' ? 'Alunos Orientados' : 'Acompanhar estágio';

  return (
    <div className="tracking-container-page theme-light">
      <Header title={headerTitle} studentName={user.nome} onBack={onBack} />

      <main className="tracking-body no-scrollbar">
        <StudentInfoBox 
          name={selectedStudent?.name || "Aluno X"} 
          company={displayCompany} 
          currentStage={3} 
          advisorName={advisorName}
        />

        <div className="stages-list">
          {stages.map((stage) => (
            <StageItem
              key={stage.number}
              number={stage.number}
              title={stage.title}
              date={stage.date}
              isActive={stage.isActive}
              isExpanded={expanded.includes(stage.number)}
              onToggle={() => toggleStage(stage.number)}
              documents={stage.documents}
              isAdvisor={true}
              onViewDocument={setSelectedDoc}
            />
          ))}
        </div>
      </main>

      <DocumentReviewModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onApprove={(id) => handleStatusChange(id, 'aprovado')}
        onReject={(id) => handleStatusChange(id, 'reprovado')}
      />
    </div>
  );
};

export default AdvisorTrackingPage;
