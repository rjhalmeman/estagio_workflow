import { z } from 'zod';

export const documentTypeSchema = z.enum([
  'PLANO_ESTAGIO',
  'RELATORIO_PARCIAL_1',
  'RELATORIO_PARCIAL_2',
  'RELATORIO_PARCIAL_3',
  'RELATORIO_PARCIAL_4',
  'RELATORIO_SUPERVISOR',
  'RELATORIO_VISITA',
  'RELATORIO_FINAL',
  'SINTESE_AVALIACOES',
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;

export const documentStatusSchema = z.object({
  status: z.enum(['APROVADO', 'REPROVADO']),
  comentario: z.string().max(500).optional(),
});

export type DocumentStatusInput = z.infer<typeof documentStatusSchema>;
