import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../config/db';
import { loginAs, setupTestEnvironment, TEST_CPFS, type TestContext } from './testHelper';

describe('Suite 2 — Cadastro de Estágio, Catálogos, Horários (2 Turnos) e Permissões', () => {
  let ctx: TestContext;
  let studentToken = '';
  let advisorToken = '';
  let otherAdvisorToken = '';
  let supervisorToken = '';
  let createdInternshipId = 0;

  before(async () => {
    ctx = await setupTestEnvironment();
    studentToken = (await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br')).token;
    advisorToken = (await loginAs(ctx.baseUrl, 'orientador.qa1@utfpr.edu.br')).token;
    otherAdvisorToken = (await loginAs(ctx.baseUrl, 'orientador.qa2@utfpr.edu.br')).token;
    supervisorToken = (await loginAs(ctx.baseUrl, 'supervisor.qa@empresa.com')).token;

    await prisma.estagio.deleteMany({
      where: { cpf_aluno: { in: [TEST_CPFS.student, TEST_CPFS.otherStudent] } },
    });
  });

  after(async () => {
    ctx.server.close();
    await prisma.$disconnect();
  });

  it('GET /api/catalog/me e /api/catalog/options devem retornar perfil e listas', async () => {
    const meRes = await fetch(`${ctx.baseUrl}/catalog/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meBody = await meRes.json();
    assert.equal(meRes.status, 200);
    assert.equal(meBody.data.cpf, TEST_CPFS.student);
    assert.equal(meBody.data.aluno.ra, 'QA90001');

    const optRes = await fetch(`${ctx.baseUrl}/catalog/options`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const optBody = await optRes.json();
    assert.equal(optRes.status, 200);
    assert.ok(Array.isArray(optBody.data.courses));
    assert.ok(Array.isArray(optBody.data.advisors));
  });

  it('POST /api/internships deve cadastrar estágio com periodo, ano e 2 turnos no mesmo dia', async () => {
    const payload = {
      stageType: 'obrigatorio',
      studentName: 'Aluno QA 1',
      matricula: 'QA90001',
      courseName: 'Curso Engenharia de Software Teste',
      periodo: '6',
      ano: '2026',
      email: 'aluno.qa1@utfpr.edu.br',
      phone: '(41) 3333-1111',
      cellphone: '(41) 99999-1111',
      schedule: {
        segunda: { start1: '08:00', end1: '12:00', start2: '13:30', end2: '17:30' },
        terca: { start1: '08:00', end1: '12:00', start2: '', end2: '' },
        quarta: { start1: '', end1: '', start2: '', end2: '' },
        quinta: { start1: '', end1: '', start2: '', end2: '' },
        sexta: { start1: '', end1: '', start2: '', end2: '' },
        sabado: { start1: '', end1: '', start2: '', end2: '' },
      },
      companyName: 'Empresa Teste QA',
      city: 'CidadeTeste',
      role: 'Tech Lead',
      sector: 'Engenharia',
      supervisorName: 'Supervisor QA',
      startDate: '2026-03-01',
      endDate: '2026-09-01',
      companyPhone: '(41) 3333-4444',
      companyCellphone: '(41) 98888-7777',
      companyEmail: 'supervisor.qa@empresa.com',
      weeklyHours: '20',
      totalHours: '400',
      professorName: 'Orientador QA 1',
      department: 'DAINF',
      professorEmail: 'orientador.qa1@utfpr.edu.br',
      ramal: '4567',
    };

    const res = await fetch(`${ctx.baseUrl}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    assert.equal(res.status, 201);
    assert.ok(body.data.idEstagio);
    createdInternshipId = body.data.idEstagio;

    const trackRes = await fetch(`${ctx.baseUrl}/internships/student/${TEST_CPFS.student}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const trackBody = await trackRes.json();
    assert.equal(trackRes.status, 200);
    assert.equal(trackBody.data.aluno.periodo, 6);
    assert.equal(trackBody.data.aluno.ano, 2026);
    const horarios = trackBody.data.plano_estagio[0].plano_horario;
    const segundaTurnos = horarios.filter((h: { dia_semana: string }) => h.dia_semana === 'SEGUNDA');
    assert.equal(segundaTurnos.length, 2);
  });

  it('Auditoria de Bug #3: POST /api/internships permite que Aluno A cadastre estágio em nome do Aluno B enviando email do Aluno B', async () => {
    const payloadOtherEmail = {
      stageType: 'obrigatorio',
      studentName: 'Aluno QA 2 Invadido',
      matricula: 'QA90002',
      courseName: 'Curso Engenharia de Software Teste',
      periodo: '3',
      email: 'aluno.qa2@utfpr.edu.br',
      phone: '(41) 3333-2222',
      schedule: {
        segunda: { start1: '08:00', end1: '12:00', start2: '', end2: '' },
        terca: { start1: '', end1: '', start2: '', end2: '' },
        quarta: { start1: '', end1: '', start2: '', end2: '' },
        quinta: { start1: '', end1: '', start2: '', end2: '' },
        sexta: { start1: '', end1: '', start2: '', end2: '' },
        sabado: { start1: '', end1: '', start2: '', end2: '' },
      },
      companyName: 'Empresa Teste QA',
      city: 'CidadeTeste',
      role: 'Dev',
      supervisorName: 'Supervisor QA',
      startDate: '2026-04-01',
      endDate: '2026-10-01',
      companyPhone: '(41) 3333-4444',
      companyEmail: 'supervisor.qa@empresa.com',
      weeklyHours: '20',
      totalHours: '400',
      professorName: 'Orientador QA 1',
      professorEmail: 'orientador.qa1@utfpr.edu.br',
    };

    const res = await fetch(`${ctx.baseUrl}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify(payloadOtherEmail),
    });
    assert.equal(
      res.status,
      403,
      'BUG DETECTADO em createInternship/resolveStudent: POST /api/internships usa input.email do body em vez de req.user.cpf, permitindo cadastrar estágio ou alterar dados de outro aluno!'
    );
  });

  it('Auditoria de Bug #4A: Omitir o campo opcional endDate quebra o cadastro no banco por violar datas_validas (data_termino === data_inicio)', async () => {
    const omittedEndDatePayload = {
      stageType: 'nao_obrigatorio',
      studentName: 'Aluno QA 1',
      matricula: 'QA90001',
      courseName: 'Curso Engenharia de Software Teste',
      periodo: '6',
      email: 'aluno.qa1@utfpr.edu.br',
      phone: '(41) 3333-1111',
      schedule: {
        segunda: { start1: '08:00', end1: '12:00', start2: '', end2: '' },
        terca: { start1: '', end1: '', start2: '', end2: '' },
        quarta: { start1: '', end1: '', start2: '', end2: '' },
        quinta: { start1: '', end1: '', start2: '', end2: '' },
        sexta: { start1: '', end1: '', start2: '', end2: '' },
        sabado: { start1: '', end1: '', start2: '', end2: '' },
      },
      companyName: 'Empresa Teste QA',
      city: 'CidadeTeste',
      role: 'Dev',
      supervisorName: 'Supervisor QA',
      startDate: '2026-05-01',
      endDate: '',
      companyPhone: '(41) 3333-4444',
      companyEmail: 'supervisor.qa@empresa.com',
      weeklyHours: '20',
      totalHours: '400',
      professorName: 'Orientador QA 1',
      professorEmail: 'orientador.qa1@utfpr.edu.br',
    };

    const res = await fetch(`${ctx.baseUrl}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify(omittedEndDatePayload),
    });
    assert.equal(
      res.status,
      201,
      'BUG DETECTADO em internshipService.ts (createEstagioPlano): endDate é opcional no formulário e no Zod, mas quando omitido faz new Date(input.endDate || input.startDate), gerando data_termino == data_inicio e falhando na constraint datas_validas (400)!'
    );
  });

  it('Auditoria de Bug #4B: Horário invertido (14:00 às 08:00) passa pelo Zod e causa erro 500 não tratado no banco (horario_valido)', async () => {
    const invertedSchedulePayload = {
      stageType: 'nao_obrigatorio',
      studentName: 'Aluno QA 1',
      matricula: 'QA90001',
      courseName: 'Curso Engenharia de Software Teste',
      periodo: '6',
      email: 'aluno.qa1@utfpr.edu.br',
      phone: '(41) 3333-1111',
      schedule: {
        segunda: { start1: '14:00', end1: '08:00', start2: '', end2: '' },
        terca: { start1: '', end1: '', start2: '', end2: '' },
        quarta: { start1: '', end1: '', start2: '', end2: '' },
        quinta: { start1: '', end1: '', start2: '', end2: '' },
        sexta: { start1: '', end1: '', start2: '', end2: '' },
        sabado: { start1: '', end1: '', start2: '', end2: '' },
      },
      companyName: 'Empresa Teste QA',
      city: 'CidadeTeste',
      role: 'Dev',
      supervisorName: 'Supervisor QA',
      startDate: '2026-05-01',
      endDate: '2026-11-01',
      companyPhone: '(41) 3333-4444',
      companyEmail: 'supervisor.qa@empresa.com',
      weeklyHours: '20',
      totalHours: '400',
      professorName: 'Orientador QA 1',
      professorEmail: 'orientador.qa1@utfpr.edu.br',
    };

    const res = await fetch(`${ctx.baseUrl}/internships`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify(invertedSchedulePayload),
    });
    assert.equal(
      res.status,
      400,
      `BUG DETECTADO em internshipSchema.ts / errorHandler.ts: horário invertido não é validado no Zod e retorna HTTP ${res.status} (Erro 500 de banco) em vez de 400!`
    );
  });

  it('Auditoria de Bug #5: Orientador B consegue editar estágio (PATCH /api/internships/:id) de aluno que pertence ao Orientador A', async () => {
    const res = await fetch(`${ctx.baseUrl}/internships/${createdInternshipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otherAdvisorToken}`,
      },
      body: JSON.stringify({ aprovado: true, nota_apresentacao: 9.5 }),
    });
    assert.equal(
      res.status,
      403,
      'BUG DETECTADO em updateInternshipController: não verifica se o professor_orientador autenticado é realmente o orientador daquele estágio!'
    );
  });

  it('GET /api/internships/external/my-list deve listar estágios do supervisor logado', async () => {
    const res = await fetch(`${ctx.baseUrl}/internships/external/my-list`, {
      headers: { Authorization: `Bearer ${supervisorToken}` },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  it('PATCH /api/internships/:id pelo orientador responsável deve atualizar dados administrativos', async () => {
    const res = await fetch(`${ctx.baseUrl}/internships/${createdInternshipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${advisorToken}`,
      },
      body: JSON.stringify({
        aprovado: true,
        nota_apresentacao: 9.8,
        processo_sei: '23064.111111/2026-99',
        valor_bolsa: 1500,
      }),
    });
    assert.equal(res.status, 200);
  });
});
