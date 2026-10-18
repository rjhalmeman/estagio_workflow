import React, { useEffect, useState } from 'react';
import { getExternalRoleInternships, type AuthUser, type InternshipTracking } from '../../../services/api';
import './ExternalHomePage.css';

interface ExternalHomePageProps {
  readonly user: AuthUser;
  readonly onLogout: () => void;
  readonly onSelectStudent: (student: { cpf: string; name: string; company: string }) => void;
  readonly onSelectOption: (option: 'acompanhar') => void;
}

function getRoleLabel(role: AuthUser['role']): string {
  if (role === 'supervisor') return 'Supervisor de Estágio (UCE)';
  if (role === 'representante_uce') return 'Representante Legal (UCE)';
  return 'Visitante';
}

export const ExternalHomePage: React.FC<ExternalHomePageProps> = ({
  user,
  onLogout,
  onSelectStudent,
  onSelectOption,
}) => {
  const [internships, setInternships] = useState<InternshipTracking[]>([]);
  const [loading, setLoading] = useState(user.role !== 'visitante');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user.role === 'visitante') return;
    let cancelled = false;

    getExternalRoleInternships()
      .then((data) => {
        if (!cancelled) setInternships(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar estágios vinculados.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user.role]);

  const handleOpenTracking = (item: InternshipTracking): void => {
    const cpf = item.aluno.cpf;
    if (!cpf) return;
    onSelectStudent({
      cpf,
      name: item.aluno.pessoa.nome,
      company: item.unidade_concedente.nome,
    });
    onSelectOption('acompanhar');
  };

  return (
    <div className="external-home-page">
      <div className="external-card">
        <div className="external-user-info">
          <h2>
            Olá <span className="external-bold-name">{user.nome}</span>
          </h2>
          <p>{getRoleLabel(user.role)}</p>
        </div>

        <div className="external-header">
          <h3>Estagiários vinculados</h3>
          <p>
            {user.role === 'visitante'
              ? 'Sua conta ainda não possui vínculo ativo como Aluno, Orientador ou Supervisor.'
              : 'Selecione um estagiário abaixo para acompanhar documentos e relatórios'}
          </p>
        </div>
        <hr className="external-divider" />

        {loading && <div className="external-state">Carregando...</div>}
        {error && <div className="external-state external-error">{error}</div>}

        {!loading && !error && user.role !== 'visitante' && internships.length === 0 && (
          <div className="external-state">Nenhum estágio vinculado encontrado.</div>
        )}

        {!loading && !error && internships.length > 0 && (
          <div className="external-list">
            {internships.map((item) => (
              <button
                key={item.id_estagio}
                type="button"
                className="external-item-btn"
                onClick={() => handleOpenTracking(item)}
              >
                <div className="external-item-info">
                  <span className="external-item-name">{item.aluno.pessoa.nome}</span>
                  <span className="external-item-sub">
                    Curso: {item.aluno.curso.nome} • Empresa: {item.unidade_concedente.nome}
                  </span>
                </div>
                <span className="external-item-arrow">↗</span>
              </button>
            ))}
          </div>
        )}

        <div className="external-footer">
          <button type="button" onClick={onLogout} className="external-logout-btn">
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalHomePage;
