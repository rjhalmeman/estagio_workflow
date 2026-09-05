import { z } from 'zod';

export const setAdvisorSchema = z.object({
  cpf_orientador: z.string().length(11, 'CPF do orientador deve ter 11 dígitos.').nullable(),
});

export type SetAdvisorInput = z.infer<typeof setAdvisorSchema>;
