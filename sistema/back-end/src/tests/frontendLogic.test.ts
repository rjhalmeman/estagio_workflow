import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

function loadTsModule<T>(relPathFromFrontSrc: string, injectedMocks: Record<string, unknown> = {}): T {
  const fullPath = path.resolve(__dirname, '../../../front-end/src', relPathFromFrontSrc);
  const source = fs.readFileSync(fullPath, 'utf-8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const exportsObj: Record<string, unknown> = {};
  const moduleObj = { exports: exportsObj };
  const customRequire = (id: string): unknown => {
    if (id in injectedMocks) return injectedMocks[id];
    const resolved = path.resolve(path.dirname(fullPath), `${id}.ts`);
    const rel = path.relative(path.resolve(__dirname, '../../../front-end/src'), resolved);
    return loadTsModule(rel, injectedMocks);
  };

  const sandbox = {
    exports: exportsObj,
    module: moduleObj,
    require: customRequire,
    Date,
    Number,
    Object,
    Array,
    Map,
    Set,
    String,
    Boolean,
    RegExp,
  };
  vm.runInNewContext(transpiled, sandbox);
  return moduleObj.exports as T;
}

const masks = loadTsModule<{
  maskPhone: (v: string) => string;
  maskTime: (v: string) => string;
  isValidTime: (v: string) => boolean;
}>('utils/masks.ts');

const internshipTypes = loadTsModule<{
  initialFormData: Record<string, unknown> & { schedule: Record<string, Record<string, string>> };
}>('types/internship.ts');

const validation = loadTsModule<{
  validateEmail: (e: string) => boolean;
  validateStudent: (d: unknown) => Record<string, string>;
  validateCompany: (d: unknown) => Record<string, string>;
  validateSchedule: (s: unknown) => Record<string, string>;
}>('utils/validation.ts', { './masks': masks });

const documentStages = loadTsModule<{
  buildTrackingStages: (t: unknown) => Array<{
    number: number;
    isActive: boolean;
    documents: Array<{ status: string; comentario: string | null }>;
  }>;
  formatDate: (iso?: string) => string;
  isDocumentType: (v: string) => boolean;
}>('utils/documentStages.ts');

const advisorStudents = loadTsModule<{
  toStudentListItem: (s: unknown) => { company: string; pendingDocs?: number };
}>('utils/advisorStudents.ts');

describe('Suite 4 — Utilitários, Máscaras, Estágios de Documentos e Validações Front-end', () => {
  it('masks.ts deve formatar telefone fixo e celular corretamente', () => {
    assert.equal(masks.maskPhone('4133334444'), '(41) 3333-4444');
    assert.equal(masks.maskPhone('41999998888'), '(41) 99999-8888');
  });

  it('masks.ts deve validar e mascarar horários corretamente', () => {
    assert.equal(masks.maskTime('0830'), '08:30');
    assert.equal(masks.isValidTime('08:30'), true);
    assert.equal(masks.isValidTime('23:59'), true);
    assert.equal(masks.isValidTime('24:00'), false);
    assert.equal(masks.isValidTime('12:60'), false);
  });

  it('documentStages.ts deve construir as 9 etapas, mapear comentários e reabrir etapa reprovada', () => {
    assert.equal(documentStages.isDocumentType('PLANO_ESTAGIO'), true);
    assert.equal(documentStages.isDocumentType('INVALIDO'), false);
    assert.equal(documentStages.formatDate('2026-05-10T00:00:00.000Z'), '10/05/2026');
    assert.equal(documentStages.formatDate(undefined), '--/--/----');

    const stages = documentStages.buildTrackingStages({
      id_estagio: 1,
      documento_estagio: [
        {
          id_documento: 10,
          id_estagio: 1,
          tipo_documento: 'PLANO_ESTAGIO',
          nome_arquivo: 'plano.pdf',
          status: 'APROVADO',
          comentario: 'Tudo certo',
          data_upload: '2026-03-02T00:00:00.000Z',
        },
        {
          id_documento: 11,
          id_estagio: 1,
          tipo_documento: 'RELATORIO_PARCIAL_1',
          nome_arquivo: 'parcial1.pdf',
          status: 'REPROVADO',
          comentario: 'Corrigir horas',
          data_upload: '2026-04-02T00:00:00.000Z',
        },
      ],
    });

    assert.equal(stages.length, 9);
    assert.equal(stages[0]?.isActive, false);
    assert.equal(stages[0]?.documents[0]?.status, 'aprovado');
    assert.equal(stages[0]?.documents[0]?.comentario, 'Tudo certo');
    assert.equal(stages[1]?.isActive, true);
    assert.equal(stages[1]?.documents[0]?.status, 'reprovado');
    assert.equal(stages[1]?.documents[0]?.comentario, 'Corrigir horas');
  });

  it('advisorStudents.ts deve contar apenas documentos com status PENDENTE', () => {
    const item = advisorStudents.toStudentListItem({
      cpf: '11111111111',
      ra: '123',
      pessoa: { nome: 'Maria', email: 'm@utfpr.edu.br' },
      curso: { nome: 'TADS' },
      estagio: [
        {
          id_estagio: 5,
          unidade_concedente: { nome: 'Tech Corp' },
          documento_estagio: [{ status: 'APROVADO' }, { status: 'PENDENTE' }, { status: 'PENDENTE' }],
        },
      ],
    });
    assert.equal(item.company, 'Tech Corp');
    assert.equal(item.pendingDocs, 2);
  });

  const defaultSchedule = {
    segunda: { start1: '', end1: '', start2: '', end2: '' },
    terca: { start1: '', end1: '', start2: '', end2: '' },
    quarta: { start1: '', end1: '', start2: '', end2: '' },
    quinta: { start1: '', end1: '', start2: '', end2: '' },
    sexta: { start1: '', end1: '', start2: '', end2: '' },
    sabado: { start1: '', end1: '', start2: '', end2: '' },
  };

  it('Auditoria de Bug #9: validateSchedule aceita horário de saída menor que horário de entrada e turno incompleto', () => {
    const schedule = {
      ...defaultSchedule,
      segunda: { start1: '18:00', end1: '08:00', start2: '13:00', end2: '' },
    };
    const errors = validation.validateSchedule(schedule);
    assert.ok(
      Object.keys(errors).length > 0,
      'BUG DETECTADO em validation.ts (validateSchedule): aceita horário final menor que inicial (18:00 às 08:00) e turno incompleto (start2 preenchido sem end2).'
    );
  });

  it('Auditoria de Bug #10: Validação do formulário no Front-end não valida campos obrigatórios do Professor (professorName / professorEmail)', () => {
    const formWithoutProfessor = {
      stageType: 'obrigatorio',
      studentName: 'João',
      matricula: '123456',
      courseName: 'TADS',
      periodo: '4',
      email: 'joao@utfpr.edu.br',
      phone: '(41) 3333-4444',
      schedule: defaultSchedule,
      companyName: 'Empresa',
      city: 'Curitiba',
      role: 'Estagiário',
      supervisorName: 'Carlos',
      startDate: '2026-03-01',
      companyPhone: '(41) 3333-5555',
      companyEmail: 'rh@empresa.com',
      weeklyHours: '20',
      totalHours: '400',
      professorName: '',
      professorEmail: '',
    };

    const allErrors = {
      ...validation.validateStudent(formWithoutProfessor),
      ...validation.validateSchedule(formWithoutProfessor.schedule),
      ...validation.validateCompany(formWithoutProfessor),
    };
    assert.ok(
      'professorName' in allErrors || 'professorEmail' in allErrors,
      'BUG DETECTADO em validation.ts / InternshipFormPage.tsx: professorName e professorEmail são obrigatórios no back-end (Zod), mas não têm validação nem exibição de erro em ProfessorDataSection.tsx no front-end!'
    );
  });

  it('Auditoria de Bug #11: validateCompany aceita endDate anterior a startDate', () => {
    const formWithInvertedDates = {
      ...internshipTypes.initialFormData,
      companyName: 'Empresa',
      city: 'Curitiba',
      role: 'Dev',
      supervisorName: 'Sup',
      startDate: '2026-10-10',
      endDate: '2026-01-01',
      companyPhone: '(41) 3333-4444',
      companyEmail: 'a@b.com',
      weeklyHours: '20',
      totalHours: '400',
    };
    assert.equal(validation.validateEmail('a@b.com'), true);
    const errors = validation.validateCompany(formWithInvertedDates);
    assert.ok(
      errors.endDate,
      'BUG DETECTADO em validation.ts (validateCompany): não valida se a data de término (endDate) é anterior à data de início (startDate).'
    );
  });
});
