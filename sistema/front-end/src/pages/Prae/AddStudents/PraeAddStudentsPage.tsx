import React, { useState } from 'react';
import { Header } from '../../../components/organisms/Header/Header';
import type { AuthUser } from '../../../services/api';
import './PraeAddStudentsPage.css';


interface StudentItem {
  id: string;
  name: string;
  company: string;
  pendingDocs?: number;
}

interface AvailableStudent {
  id: string;
  name: string;
  ra: string;
  company: string;
}

interface PraeAddStudentsPageProps {
  user: AuthUser;
  currentStudents: StudentItem[];
  onBack: () => void;
  onConfirm: (selected: Array<{ id: string; name: string; company: string }>) => void;
}

const allAvailableStudents: AvailableStudent[] = [
  { id: 'al-a', name: 'Aluno A', ra: 'a2165981', company: 'Appmoove' },
  { id: 'al-b', name: 'Aluno B', ra: 'a2165982', company: 'Coamo' },
  { id: 'al-c', name: 'Aluno C', ra: 'a2165983', company: 'Appmoove' },
  { id: 'al-d', name: 'Aluno D', ra: 'a2165984', company: 'Google' },
  { id: 'al-e', name: 'Aluno E', ra: 'a2165985', company: 'Microsoft' },
  { id: 'al-f', name: 'Aluno F', ra: 'a2165986', company: 'Appmoove' },
  { id: 'al-g', name: 'Aluno G', ra: 'a2165987', company: 'Coamo' },
  { id: 'al-h', name: 'Aluno H', ra: 'a2165988', company: 'Indefinida' },
];

export const PraeAddStudentsPage: React.FC<PraeAddStudentsPageProps> = ({
  user,
  currentStudents,
  onBack,
  onConfirm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const candidates = allAvailableStudents.filter(
    (student) => !currentStudents.some((cs) => cs.id === student.id)
  );

  const filteredCandidates = candidates.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.ra.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const selectedStudentsData = allAvailableStudents
      .filter((s) => selectedIds.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name, company: s.company }));
    
    onConfirm(selectedStudentsData);
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
            {filteredCandidates.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              return (
                <button
                  key={student.id}
                  className={`prae-add-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleToggleSelect(student.id)}
                  aria-label={`Selecionar ${student.name}`}
                  aria-pressed={isSelected}
                >
                  <div className="prae-add-item-info">
                    <span className="prae-add-item-name">{student.name}</span>
                    <span className="prae-add-item-ra">{student.ra}</span>
                  </div>
                </button>
              );
            })}
            {filteredCandidates.length === 0 && (
              <div className="prae-add-empty">Nenhum aluno disponível.</div>
            )}
          </div>
        </div>
      </main>

      <footer className="prae-add-footer">
        <button
          className="prae-add-confirm-btn"
          disabled={selectedIds.length === 0}
          onClick={handleConfirm}
        >
          Confirmar (selecionados: {selectedIds.length})
        </button>
      </footer>
    </div>
  );
};

export default PraeAddStudentsPage;
