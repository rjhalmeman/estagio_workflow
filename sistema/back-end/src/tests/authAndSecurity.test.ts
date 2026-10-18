import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../config/db';
import { loginAs, setupTestEnvironment, TEST_CPFS, type TestContext } from './testHelper';

describe('Suite 1 — Autenticação, Sessão e Segurança', () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await setupTestEnvironment();
  });

  after(async () => {
    ctx.server.close();
  });

  it('GET /api/health deve retornar status OK e banco conectado', async () => {
    const res = await fetch(`${ctx.baseUrl}/health`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'OK');
    assert.match(body.database, /Conectado/);
  });

  it('POST /api/auth/login deve autenticar usuário válido e definir cookie httpOnly', async () => {
    const { token, cookie, status } = await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br');
    assert.equal(status, 200);
    assert.ok(token.length > 10);
    assert.match(cookie, /estagio_refresh_token=/);
    assert.match(cookie, /HttpOnly/i);
  });

  it('POST /api/auth/refresh deve renovar o token usando o cookie httpOnly', async () => {
    const { cookie } = await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br');
    const cookiePair = cookie.split(';')[0] || '';
    const res = await fetch(`${ctx.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: cookiePair },
    });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.status, 'success');
    assert.ok(body.token);
  });

  it('Rotas protegidas devem rejeitar requisições sem token com 401', async () => {
    const res = await fetch(`${ctx.baseUrl}/advisors`);
    assert.equal(res.status, 401);
  });

  it('Controle de acesso: Aluno não deve acessar rota exclusiva do PRAE (403)', async () => {
    const { token } = await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br');
    const res = await fetch(`${ctx.baseUrl}/students/unassigned`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 403);
  });

  it('Controle de dono: Aluno não deve consultar estágio de outro CPF (403)', async () => {
    const { token } = await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br');
    const res = await fetch(`${ctx.baseUrl}/internships/student/${TEST_CPFS.otherStudent}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 403);
  });

  it('Controle de dono: Orientador não deve listar alunos de outro orientador (403)', async () => {
    const { token } = await loginAs(ctx.baseUrl, 'orientador.qa1@utfpr.edu.br');
    const res = await fetch(`${ctx.baseUrl}/advisors/${TEST_CPFS.otherAdvisor}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 403);
  });

  it('Auditoria de Bug #1: seed.ts grava senhas em texto puro sem hashPassword', () => {
    const seedPath = path.resolve(__dirname, '../seed.ts');
    const content = fs.readFileSync(seedPath, 'utf-8');
    const usesPlainTextSenha = content.includes("senha: 'senha'");
    assert.equal(
      usesPlainTextSenha,
      false,
      'BUG DETECTADO em seed.ts: senhas são inseridas em texto puro ("senha") sem bcrypt, impedindo login dos usuários do seed.'
    );
  });

  it('Auditoria de Bug #2: refresh token aceita access token comum como se fosse refresh token', async () => {
    const { token } = await loginAs(ctx.baseUrl, 'aluno.qa1@utfpr.edu.br');
    const res = await fetch(`${ctx.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `estagio_refresh_token=${token}` },
    });
    assert.equal(
      res.status,
      401,
      'BUG DETECTADO em jwt.ts/authService.ts: verifyToken não diferencia access token de refresh token (campo type: "refresh" não é validado).'
    );
  });

  it('Rate limiting no login deve bloquear após 15 tentativas do mesmo IP (429)', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 16; i++) {
      const res = await fetch(`${ctx.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '203.0.113.99',
        },
        body: JSON.stringify({ email: 'naoexiste@utfpr.edu.br', password: 'err' }),
      });
      lastStatus = res.status;
    }
    assert.equal(lastStatus, 429);
  });
});

after(async () => {
  await prisma.$disconnect();
});
