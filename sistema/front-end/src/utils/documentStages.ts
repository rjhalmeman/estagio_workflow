import type { Document } from '../components/organisms/DocumentRow/DocumentRow';
import type { DocumentType, InternshipTracking } from '../services/api';

export interface Stage {
  number: number;
  title: string;
  date: string;
  isActive?: boolean;
  documents: Document[];
}

export const STAGE_DOCUMENT_MAP: Array<{ number: number; title: string; type: DocumentType }> = [
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

export function formatDate(iso: string | undefined): string {
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

export function buildTrackingStages(tracking: InternshipTracking): Stage[] {
  const sentByType = new Map(tracking.documento_estagio.map((doc) => [doc.tipo_documento, doc]));
  const firstPendingIndex = STAGE_DOCUMENT_MAP.findIndex((s) => {
    const sent = sentByType.get(s.type);
    return !sent || sent.status === 'REPROVADO';
  });

  return STAGE_DOCUMENT_MAP.map((stage, index) => {
    const sent = sentByType.get(stage.type);
    const doc: Document = {
      id: stage.type,
      realId: sent?.id_documento,
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
