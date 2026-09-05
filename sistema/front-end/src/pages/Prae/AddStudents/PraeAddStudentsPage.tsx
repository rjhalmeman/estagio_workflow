import React, { useEffect, useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import { getUnassignedStudents, setStudentAdvisor } from '../../../services/api';
import type { AuthUser, UnassignedStudent } from '../../../services/api';
import './PraeAddStudentsPage.css';

interface Advisor {
  id: string;
  name: string;
}

interface PraeAddStudentsPageProps {
  user: AuthUser;
  advisor: Advisor;
  onBack: () => void;
  onConfirm: () => void;
}

export const PraeAddStudentsPage: React.FC<PraeAddStudentsPageProps> = ({
  user,
  advisor,
  onBack,
  onConfirm,
}) => {
  const [candidates, setCandidates] = useState<UnassignedStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCpfs, setSelectedCpfs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getUnassignedStudents()
      .then((data) => {
        if (!cancelled) setCandidates(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar alunos disponíveis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCandidates = candidates.filter(
    (student) =>
      student.pessoa.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.ra.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (cpf: string) => {
    setSelectedCpfs((prev) =>
      prev.includes(cpf) ? prev.filter((x) => x !== cpf) : [...prev, cpf]
    );
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await Promise.all(selectedCpfs.map((cpf) => setStudentAdvisor(cpf, advisor.id)));
      onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular alunos.');
      setSubmitting(false);
    }
  };

  return (
    <div className="prae-add-page theme-light">
      <Header title="Adicionar Alunos" studentName={user.nome} onBack={onBack} />

      <main className="prae-add-body no-scrollbar">
        <div className="prae-add-card">
          <div className="prae-add-header">
            <h3>Alunos</h3>
            <p>Selecione um aluno</p>
          </div>

          <div className="prae-add-search-section">
            <label className="prae-add-search-label" htmlFor="prae-add-search-input">
              Buscar
            </label>
            <input
              id="prae-add-search-input"
              type="text"
              className="prae-add-search-input"
              placeholder="Digite o nome ou RA do aluno"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="prae-add-list">
            {error && <div className="prae-add-empty">{error}</div>}

            {loading && !error && <div className="prae-add-empty">Carregando...</div>}

            {!loading && !error && filteredCandidates.map((student) => {
              const isSelected = selectedCpfs.includes(student.cpf);
              return (
                <button
                  key={student.cpf}
                  className={`prae-add-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleSelect(student.cpf)}
                  aria-label={`Selecionar ${student.pessoa.nome}`}
                  aria-pressed={isSelected}
                >
                  <div className="prae-add-item-info">
                    <span className="prae-add-item-name">{student.pessoa.nome}</span>
                    <span className="prae-add-item-ra">{student.ra}</span>
                  </div>
                </button>
              );
            })}
            {!loading && !error && filteredCandidates.length === 0 && (
              <div className="prae-add-empty">Nenhum aluno disponível.</div>
            )}
          </div>
        </div>
      </main>

      <footer className="prae-add-footer">
        <button
          className="prae-add-confirm-btn"
          disabled={selectedCpfs.length === 0 || submitting}
          onClick={handleConfirm}
        >
          {submitting ? 'Vinculando...' : `Confirmar (selecionados: ${selectedCpfs.length})`}
        </button>
      </footer>
    </div>
  );
};

export default PraeAddStudentsPage;
