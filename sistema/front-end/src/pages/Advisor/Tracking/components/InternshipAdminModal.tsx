import React, { useState } from 'react';
import { Input } from '../../../../components/atoms/Input/Input';
import type { InternshipTracking, UpdateInternshipPayload } from '../../../../services/api';
import './InternshipAdminModal.css';

interface InternshipAdminModalProps {
  readonly isOpen: boolean;
  readonly tracking: InternshipTracking;
  readonly onClose: () => void;
  readonly onSave: (payload: UpdateInternshipPayload) => Promise<void>;
}

interface AdminFormState {
  aprovado: boolean;
  notaApresentacao: string;
  processoSei: string;
  valorBolsa: string;
  seguroApolice: string;
  seguradora: string;
  beneficios: string;
}

function buildInitialState(tracking: InternshipTracking): AdminFormState {
  return {
    aprovado: Boolean(tracking.aprovado),
    notaApresentacao:
      tracking.nota_apresentacao !== null && tracking.nota_apresentacao !== undefined
        ? String(tracking.nota_apresentacao)
        : '',
    processoSei: tracking.processo_sei ?? '',
    valorBolsa:
      tracking.valor_bolsa !== null && tracking.valor_bolsa !== undefined
        ? String(tracking.valor_bolsa)
        : '0',
    seguroApolice: tracking.seguro_apolice ?? '',
    seguradora: tracking.seguradora ?? '',
    beneficios: tracking.beneficios ?? '',
  };
}

function toPayload(form: AdminFormState): UpdateInternshipPayload {
  const nota = form.notaApresentacao.trim() ? Number(form.notaApresentacao) : undefined;
  const bolsa = form.valorBolsa.trim() ? Number(form.valorBolsa) : undefined;
  return {
    aprovado: form.aprovado,
    nota_apresentacao: nota !== undefined && !Number.isNaN(nota) ? nota : undefined,
    processo_sei: form.processoSei.trim() || undefined,
    valor_bolsa: bolsa !== undefined && !Number.isNaN(bolsa) ? bolsa : undefined,
    seguro_apolice: form.seguroApolice.trim() || undefined,
    seguradora: form.seguradora.trim() || undefined,
    beneficios: form.beneficios.trim() || undefined,
  };
}

export const InternshipAdminModal: React.FC<InternshipAdminModalProps> = ({
  isOpen,
  tracking,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<AdminFormState>(() => buildInitialState(tracking));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateField = <K extends keyof AdminFormState>(key: K, val: AdminFormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(toPayload(form));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Dados Administrativos do Estágio</h3>
          <button className="admin-modal-close" onClick={onClose} aria-label="Fechar modal">
            <span className="material-icons">close</span>
          </button>
        </div>

        {error && (
          <div className="admin-modal-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <label className="ui-checkbox-label admin-checkbox-row" htmlFor="estagio-aprovado">
            <input
              id="estagio-aprovado"
              type="checkbox"
              className="ui-checkbox-input"
              checked={form.aprovado}
              onChange={(e) => updateField('aprovado', e.target.checked)}
            />
            <span className="ui-checkbox-box">
              {form.aprovado && <span className="material-icons ui-checkbox-icon">check</span>}
            </span>
            <span>Estágio aprovado / homologado</span>
          </label>

          <div className="admin-modal-grid">
            <Input
              label="Nota de Apresentação (0 a 10)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={form.notaApresentacao}
              onChange={(e) => updateField('notaApresentacao', e.target.value)}
            />
            <Input
              label="Processo SEI"
              placeholder="Ex: 23064.000000/2026-00"
              value={form.processoSei}
              onChange={(e) => updateField('processoSei', e.target.value)}
            />
            <Input
              label="Valor da Bolsa (R$)"
              type="number"
              step="0.01"
              min="0"
              value={form.valorBolsa}
              onChange={(e) => updateField('valorBolsa', e.target.value)}
            />
            <Input
              label="Apólice de Seguro"
              placeholder="Nº da apólice"
              value={form.seguroApolice}
              onChange={(e) => updateField('seguroApolice', e.target.value)}
            />
            <Input
              label="Seguradora"
              placeholder="Nome da seguradora"
              value={form.seguradora}
              onChange={(e) => updateField('seguradora', e.target.value)}
            />
            <Input
              label="Benefícios"
              placeholder="Auxílio transporte, alimentação..."
              value={form.beneficios}
              onChange={(e) => updateField('beneficios', e.target.value)}
            />
          </div>

          <div className="admin-modal-footer">
            <button type="button" className="admin-btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="admin-btn-save" disabled={saving}>
              <span className="material-icons admin-btn-icon">check_circle</span>
              <span>{saving ? 'Salvando...' : 'Salvar alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
