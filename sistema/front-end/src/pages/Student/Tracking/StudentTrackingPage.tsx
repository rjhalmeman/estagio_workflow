import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { StageItem } from '../../../components/organisms/StageItem/StageItem';
import type { Document } from '../../../components/organisms/DocumentRow/DocumentRow';
import {
  getInternshipTracking,
  uploadDocument,
  type AuthUser,
  type DocumentType,
  type InternshipTracking,
} from '../../../services/api';
import './StudentTrackingPage.css';

interface SelectedStudent {
  name: string;
  company: string;
}

interface StudentTrackingPageProps {
  user: AuthUser;
  selectedStudent: SelectedStudent | null;
  onBack: () => void;
}

interface Stage {
  number: number;
  title: string;
  date: string;
  isActive?: boolean;
  documents: Document[];
}

const STAGE_DOCUMENT_MAP: Array<{ number: number; title: string; type: DocumentType }> = [
  { number: 1, title: 'Plano de estágio', type: 'PLANO_ESTAGIO' },
  { number: 2, title: 'Parcial 1', type: 'RELATORIO_PARCIAL_1' },
  { number: 3, title: 'Parcial 2', type: 'RELATORIO_PARCIAL_2' },
  { number: 4, title: 'Parcial 3', type: 'RELATORIO_PARCIAL_3' },
  { number: 5, title: 'Parcial 4', type: 'RELATORIO_PARCIAL_4' },
  { number: 6, title: 'Supervisor', type: 'RELATORIO_SUPERVISOR' },
  { number: 7, title: 'Visita', type: 'RELATORIO_VISITA' },
  { number: 8, title: 'Relatório final', type: 'RELATORIO_FINAL' },
  { number: 9, title: 'Síntese de avaliações', type: 'SINTESE_AVALIACOES' },
];

function formatDate(iso: string | undefined): string {
  if (!iso) return '--/--/----';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--/--/----';
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function mapDocumentStatus(sent: InternshipTracking['documento_estagio'][number] | undefined): Document['status'] {
  if (!sent) return 'pendente';
  if (sent.status === 'APROVADO') return 'aprovado';
  if (sent.status === 'REPROVADO') return 'reprovado';
  return 'enviado';
}

function buildStages(tracking: InternshipTracking): Stage[] {
  const sentByType = new Map(tracking.documento_estagio.map((doc) => [doc.tipo_documento, doc]));
  const firstPendingIndex = STAGE_DOCUMENT_MAP.findIndex((s) => {
    const sent = sentByType.get(s.type);
    return !sent || sent.status === 'REPROVADO';
  });

  return STAGE_DOCUMENT_MAP.map((stage, index) => {
    const sent = sentByType.get(stage.type);
    const doc: Document = {
      id: stage.type,
      name: sent ? sent.nome_arquivo : stage.title,
      status: mapDocumentStatus(sent),
    };

    return {
      number: stage.number,
      title: stage.title,
      date: formatDate(sent?.data_upload),
      isActive: index === firstPendingIndex,
      documents: [doc],
    };
  });
}

export const StudentTrackingPage: React.FC<StudentTrackingPageProps> = ({ user, onBack }) => {
  const [tracking, setTracking] = useState<InternshipTracking | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getInternshipTracking(user.cpf)
      .then((data) => {
        if (cancelled) return;
        setTracking(data);
        if (data) {
          const built = buildStages(data);
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
  }, [user.cpf]);

  const toggleStage = (num: number) => {
    setExpanded((prev) =>
      prev.includes(num) ? prev.filter((x) => x !== num) : [...prev, num]
    );
  };

  const handleUpload = async (docId: string, file: File) => {
    if (!tracking) return;
    setUploadingId(docId);
    try {
      await uploadDocument(tracking.id_estagio, docId as DocumentType, file);
      const refreshed = await getInternshipTracking(user.cpf);
      if (refreshed) {
        setTracking(refreshed);
        setStages(buildStages(refreshed));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar documento.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="tracking-container-page theme-light">
      <Header title="Acompanhar estágio" studentName={user.nome} onBack={onBack} />

      <main className="tracking-body no-scrollbar">
        {uploadingId && <div className="tracking-toast">Enviando documento...</div>}
        {error && <div className="tracking-toast">{error}</div>}

        {loading && <div className="tracking-loading-state">Carregando...</div>}

        {!loading && !tracking && (
          <div className="tracking-empty-state">
            Nenhum estágio cadastrado ainda. Cadastre um estágio para acompanhar o andamento aqui.
          </div>
        )}

        {!loading && tracking && (
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
                onUpload={handleUpload}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentTrackingPage;
