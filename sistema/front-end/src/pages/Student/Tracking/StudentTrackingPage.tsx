import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { StageItem } from '../../../components/organisms/StageItem/StageItem';
import {
  getInternshipTracking,
  uploadDocument,
  type AuthUser,
  type DocumentType,
  type InternshipTracking,
} from '../../../services/api';
import { buildTrackingStages, type Stage } from '../../../utils/documentStages';
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
        setStages(buildTrackingStages(refreshed));
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
