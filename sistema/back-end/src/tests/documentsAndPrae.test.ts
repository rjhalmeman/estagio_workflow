import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../config/db';
import { loginAs, setupTestEnvironment, TEST_CPFS, type TestContext } from './testHelper';

describe('Suite 3 — Upload/Download/Avaliação de Documentos e Fluxo PRAE', () => {
  let ctx: TestContext;
  let studentToken = '';
  let otherStudentToken = '';
  let advisorToken = '';
  let otherAdvisorToken = '';
  let praeToken = '';
  let supervisorToken = '';
  let internshipId = 0;
  let uploadedDocId = 0;

  before(async () => {
    ctx = await setupTestEnvironment();
    studentToken = (await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br')).token;
    otherStudentToken = (await loginAs(ctx.baseUrl, 'aluno.qa2@utfpr.edu.br')).token;
    advisorToken = (await loginAs(ctx.baseUrl, 'orientador.qa1@utfpr.edu.br')).token;
    otherAdvisorToken = (await loginAs(ctx.baseUrl, 'orientador.qa2@utfpr.edu.br')).token;
    praeToken = (await loginAs(ctx.baseUrl, 'prae.qa@utfpr.edu.br')).token;
    supervisorToken = (await loginAs(ctx.baseUrl, 'supervisor.qa@empresa.com')).token;

    const estagio = await prisma.estagio.create({
      data: {
        numero_termo: `T-${Date.now()}`,
        tipo: 'OBRIGATORIO',
        cpf_aluno: TEST_CPFS.student,
        cnpj_uce: ctx.cnpjUce,
        cpf_supervisor: TEST_CPFS.supervisor,
        cpf_orientador: TEST_CPFS.advisor,
        data_inicio: new Date('2026-03-01'),
        data_termino: new Date('2026-09-01'),
      },
    });
    internshipId = estagio.id_estagio;
  });

  after(async () => {
    ctx.server.close();
    await prisma.$disconnect();
  });

  it('POST /api/documents/:id/upload deve permitir envio de PDF válido pelo aluno', async () => {
    const form = new FormData();
    form.append('documentType', 'PLANO_ESTAGIO');
    form.append('file', new Blob(['%PDF-1.4 conteudo teste'], { type: 'application/pdf' }), 'plano.pdf');

    const res = await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: form,
    });
    assert.equal(res.status, 200);

    const doc = await prisma.documento_estagio.findFirst({
      where: { id_estagio: internshipId, tipo_documento: 'PLANO_ESTAGIO' },
    });
    assert.ok(doc);
    assert.equal(doc.status, 'PENDENTE');
    uploadedDocId = doc.id_documento;
  });

  it('POST /api/documents/:id/upload deve rejeitar arquivo executável (.exe) com 400', async () => {
    const form = new FormData();
    form.append('documentType', 'RELATORIO_PARCIAL_1');
    form.append('file', new Blob(['MZ...'], { type: 'application/x-msdownload' }), 'virus.exe');

    const res = await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: form,
    });
    assert.equal(res.status, 400);
  });

  it('Auditoria de Bug #6: Aluno B consegue fazer upload de documento no estágio do Aluno A (falta checagem de dono no uploadDoc)', async () => {
    const form = new FormData();
    form.append('documentType', 'RELATORIO_FINAL');
    form.append('file', new Blob(['%PDF-1.4 invadido'], { type: 'application/pdf' }), 'invadido.pdf');

    const res = await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${otherStudentToken}` },
      body: form,
    });
    assert.equal(
      res.status,
      403,
      'BUG DETECTADO em documentController.ts (uploadDoc): não verifica se o internshipId pertence ao aluno/supervisor autenticado!'
    );
  });

  it('Auditoria de Bug #7: Aluno B consegue baixar documento confidencial do Aluno A via GET /api/documents/:id/download', async () => {
    const res = await fetch(`${ctx.baseUrl}/documents/${uploadedDocId}/download`, {
      headers: { Authorization: `Bearer ${otherStudentToken}` },
    });
    assert.equal(
      res.status,
      403,
      'BUG DETECTADO em documentController.ts (downloadDoc): qualquer usuário autenticado pode baixar qualquer documento por ID sem checagem de vínculo!'
    );
  });

  it('Auditoria de Bug #8: Orientador B consegue reprovar/aprovar documento de aluno do Orientador A', async () => {
    const res = await fetch(`${ctx.baseUrl}/documents/${uploadedDocId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherAdvisorToken}`,
      },
      body: JSON.stringify({ status: 'REPROVADO', comentario: 'Reprovado por outro orientador' }),
    });
    assert.equal(
      res.status,
      403,
      'BUG DETECTADO em documentController.ts (updateStatus): não valida se o orientador logado é o orientador do aluno dono do documento!'
    );
  });

  it('PATCH /api/documents/:id/status pelo orientador deve salvar status e comentário, e reenvio deve resetar para PENDENTE', async () => {
    const revRes = await fetch(`${ctx.baseUrl}/documents/${uploadedDocId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${advisorToken}`,
      },
      body: JSON.stringify({ status: 'REPROVADO', comentario: 'Faltou assinatura' }),
    });
    const revBody = await revRes.json();
    assert.equal(revRes.status, 200);
    assert.equal(revBody.data.status, 'REPROVADO');
    assert.equal(revBody.data.comentario, 'Faltou assinatura');

    const form = new FormData();
    form.append('documentType', 'PLANO_ESTAGIO');
    form.append('file', new Blob(['%PDF-1.4 corrigido'], { type: 'application/pdf' }), 'plano_v2.pdf');
    await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: form,
    });

    const updated = await prisma.documento_estagio.findUnique({
      where: { id_documento: uploadedDocId },
    });
    assert.equal(updated?.status, 'PENDENTE');
    assert.equal(updated?.comentario, null);
  });

  it('Fluxo PRAE: listar alunos sem orientador, vincular orientador, listar por orientador e desvincular', async () => {
    await fetch(`${ctx.baseUrl}/students/${TEST_CPFS.student}/advisor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${praeToken}`,
      },
      body: JSON.stringify({ cpf_orientador: null }),
    });

    const unRes = await fetch(`${ctx.baseUrl}/students/unassigned?idCurso=${ctx.idCurso}`, {
      headers: { Authorization: `Bearer ${praeToken}` },
    });
    const unBody = await unRes.json();
    assert.equal(unRes.status, 200);
    assert.ok(unBody.data.some((s: { cpf: string }) => s.cpf === TEST_CPFS.student));

    const linkRes = await fetch(`${ctx.baseUrl}/students/${TEST_CPFS.student}/advisor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${praeToken}`,
      },
      body: JSON.stringify({ cpf_orientador: TEST_CPFS.advisor }),
    });
    assert.equal(linkRes.status, 200);

    const advStudentsRes = await fetch(`${ctx.baseUrl}/advisors/${TEST_CPFS.advisor}/students`, {
      headers: { Authorization: `Bearer ${advisorToken}` },
    });
    const advStudentsBody = await advStudentsRes.json();
    assert.equal(advStudentsRes.status, 200);
    assert.ok(advStudentsBody.data.some((s: { cpf: string }) => s.cpf === TEST_CPFS.student));
  });

  it('Supervisor deve conseguir enviar RELATORIO_SUPERVISOR e ser bloqueado (403) ao tentar enviar PLANO_ESTAGIO', async () => {
    const formOk = new FormData();
    formOk.append('documentType', 'RELATORIO_SUPERVISOR');
    formOk.append('file', new Blob(['%PDF-1.4 sup'], { type: 'application/pdf' }), 'relatorio_sup.pdf');

    const resOk = await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${supervisorToken}` },
      body: formOk,
    });
    assert.equal(resOk.status, 200);

    const formForbidden = new FormData();
    formForbidden.append('documentType', 'PLANO_ESTAGIO');
    formForbidden.append('file', new Blob(['%PDF-1.4 hack'], { type: 'application/pdf' }), 'plano_hack.pdf');

    const resForbidden = await fetch(`${ctx.baseUrl}/documents/${internshipId}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${supervisorToken}` },
      body: formForbidden,
    });
    assert.equal(resForbidden.status, 403);
  });
});
