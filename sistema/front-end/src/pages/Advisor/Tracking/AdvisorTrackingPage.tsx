import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { StageItem } from '../../../components/organisms/StageItem/StageItem';
import { StudentInfoBox } from './components/StudentInfoBox';
import { DocumentReviewModal } from './components/DocumentReviewModal';
import type { Document } from '../../../components/organisms/DocumentRow/DocumentRow';
import { getInternshipTracking, updateDocumentStatus, type AuthUser } from '../../../services/api';
import { buildTrackingStages, type Stage } from '../../../utils/documentStages';
import './AdvisorTrackingPage.css';

interface SelectedStudent {
  cpf?: string;
  name: string;
  company: string;
}

interface AdvisorTrackingPageProps {
  user: AuthUser;
  selectedStudent: SelectedStudent | null;
  advisorName?: string;
  onBack: () => void;
}

export const AdvisorTrackingPage: React.FC<AdvisorTrackingPageProps> = ({
  user,
  selectedStudent,
  advisorName,
  onBack,
}) => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const cpf = selectedStudent?.cpf;
  const [loading, setLoading] = useState(Boolean(cpf));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cpf) return;

    let cancelled = false;

    getInternshipTracking(cpf)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          const built = buildTrackingStages(data);
          setStages(built);
          const active = built.find((s) => s.isActive);
          setExpanded(active ? [active.number] : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar acompanhamento.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cpf]);

  const toggleStage = (num: number) => {
    setExpanded((prev) =>
      prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]
    );
  };

  const handleReview = async (doc: Document, status: 'APROVADO' | 'REPROVADO') => {
    if (!doc.realId) {
      setError('Este documento ainda não foi enviado pelo aluno.');
      return;
    }
    try {
      await updateDocumentStatus(doc.realId, status);
      if (cpf) {
        const refreshed = await getInternshipTracking(cpf);
        if (refreshed) setStages(buildTrackingStages(refreshed));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do documento.');
    }
  };

  const currentStage = stages.find((s) => s.isActive)?.number ?? stages.length;
  const headerTitle = user.role === 'professor_prae' ? 'Alunos Orientados' : 'Acompanhar estágio';

  return (
    <div className="tracking-container-page theme-light">
      <Header title={headerTitle} studentName={user.nome} onBack={onBack} />

      <main className="tracking-body no-scrollbar">
        {error && <div className="tracking-toast">{error}</div>}

        {loading && <div className="tracking-loading-state">Carregando...</div>}

        {!loading && !cpf && (
          <div className="tracking-empty-state">Selecione um aluno para acompanhar o estágio.</div>
        )}

        {!loading && cpf && stages.length === 0 && (
          <div className="tracking-empty-state">Este aluno ainda não tem estágio cadastrado.</div>
        )}

        {!loading && cpf && stages.length > 0 && (
          <>
            <StudentInfoBox
              name={selectedStudent?.name || ''}
              company={selectedStudent?.company || ''}
              currentStage={currentStage}
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
          </>
        )}
      </main>

      <DocumentReviewModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onApprove={() => selectedDoc && handleReview(selectedDoc, 'APROVADO')}
        onReject={() => selectedDoc && handleReview(selectedDoc, 'REPROVADO')}
      />
    </div>
  );
};

export default AdvisorTrackingPage;
