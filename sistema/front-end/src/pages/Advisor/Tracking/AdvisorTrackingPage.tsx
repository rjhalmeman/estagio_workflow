import React, { useCallback, useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { StageItem } from '../../../components/organisms/StageItem/StageItem';
import { StudentInfoBox } from './components/StudentInfoBox';
import { DocumentReviewModal } from './components/DocumentReviewModal';
import { InternshipAdminModal } from './components/InternshipAdminModal';
import type { Document } from '../../../components/organisms/DocumentRow/DocumentRow';
import {
  getInternshipTracking,
  updateDocumentStatus,
  updateInternshipDetails,
  uploadDocument,
  type AuthUser,
  type InternshipTracking,
  type UpdateInternshipPayload,
} from '../../../services/api';
import { buildTrackingStages, isDocumentType, type Stage } from '../../../utils/documentStages';
import './AdvisorTrackingPage.css';

interface SelectedStudent {
  readonly cpf?: string;
  readonly name: string;
  readonly company: string;
}

interface AdvisorTrackingPageProps {
  readonly user: AuthUser;
  readonly selectedStudent: SelectedStudent | null;
  readonly advisorName?: string;
  readonly onBack: () => void;
}

export const AdvisorTrackingPage: React.FC<AdvisorTrackingPageProps> = ({
  user,
  selectedStudent,
  advisorName,
  onBack,
}) => {
  const [tracking, setTracking] = useState<InternshipTracking | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const cpf = selectedStudent?.cpf;
  const [loading, setLoading] = useState(Boolean(cpf));
  const [error, setError] = useState<string | null>(null);

  const loadTracking = useCallback(async (studentCpf: string): Promise<void> => {
    const data = await getInternshipTracking(studentCpf);
    setTracking(data);
    if (data) {
      const built = buildTrackingStages(data);
      setStages(built);
      const active = built.find((s) => s.isActive);
      setExpanded((prev) => (prev.length > 0 ? prev : active ? [active.number] : []));
    }
  }, []);

  useEffect(() => {
    if (!cpf) return;
    let cancelled = false;

    loadTracking(cpf)
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar acompanhamento.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cpf, loadTracking]);

  const toggleStage = (num: number): void => {
    setExpanded((prev) => (prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]));
  };

  const handleReview = async (
    doc: Document,
    status: 'APROVADO' | 'REPROVADO',
    comentario?: string
  ): Promise<void> => {
    if (!doc.realId) {
      setError('Este documento ainda não foi enviado pelo aluno.');
      return;
    }
    try {
      await updateDocumentStatus(doc.realId, status, comentario);
      if (cpf) await loadTracking(cpf);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do documento.');
    }
  };

  const handleSaveAdmin = async (payload: UpdateInternshipPayload): Promise<void> => {
    if (!tracking || !cpf) return;
    await updateInternshipDetails(tracking.id_estagio, payload);
    await loadTracking(cpf);
  };

  const handleSupervisorUpload = async (docId: string, file: File): Promise<void> => {
    if (!tracking || !cpf || !isDocumentType(docId)) return;
    try {
      await uploadDocument(tracking.id_estagio, docId, file);
      await loadTracking(cpf);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar relatório.');
    }
  };

  const currentStage = stages.find((s) => s.isActive)?.number ?? stages.length;
  const headerTitle = user.role === 'professor_prae' ? 'Alunos Orientados' : 'Acompanhar estágio';
  const canEditAdmin = user.role === 'professor_orientador' || user.role === 'professor_prae';
  const resolvedCompany = selectedStudent?.company || tracking?.unidade_concedente.nome || '';
  const resolvedAdvisor = advisorName || tracking?.professor_orientador?.pessoa.nome;

  return (
    <div className="tracking-container-page">
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

        {!loading && cpf && tracking && stages.length > 0 && (
          <>
            <StudentInfoBox
              name={selectedStudent?.name || tracking.aluno.pessoa.nome}
              company={resolvedCompany}
              currentStage={currentStage}
              advisorName={resolvedAdvisor}
              approved={tracking.aprovado}
              processoSei={tracking.processo_sei}
              notaApresentacao={tracking.nota_apresentacao}
              canEditAdmin={canEditAdmin}
              onEditAdmin={() => setIsAdminModalOpen(true)}
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
                  isAdvisor={canEditAdmin}
                  onUpload={user.role === 'supervisor' ? handleSupervisorUpload : undefined}
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
        onApprove={(comentario) => selectedDoc && handleReview(selectedDoc, 'APROVADO', comentario)}
        onReject={(comentario) => selectedDoc && handleReview(selectedDoc, 'REPROVADO', comentario)}
      />

      {tracking && (
        <InternshipAdminModal
          isOpen={isAdminModalOpen}
          tracking={tracking}
          onClose={() => setIsAdminModalOpen(false)}
          onSave={handleSaveAdmin}
        />
      )}
    </div>
  );
};

export default AdvisorTrackingPage;
