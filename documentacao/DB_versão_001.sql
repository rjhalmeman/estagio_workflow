-- ============================================================
--  SISTEMA DE GERENCIAMENTO DE ESTÁGIO
--  Schema melhorado — PostgreSQL
--  Princípios aplicados:
--    • Relações 1:1 via CPF (sem id_* redundante)
--    • Formas normais 1FN, 2FN, 3FN
--    • Tabela central: estagio
--    • Plano de estágio separado (histórico de horários/condições)
--    • Documentos em tabela dedicada (BYTEA)
-- ============================================================

-- ------------------------------------------------------------
-- 0. LIMPEZA (útil para recriar do zero em ambiente de teste)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS documento_estagio   CASCADE;
DROP TABLE IF EXISTS plano_horario       CASCADE;
DROP TABLE IF EXISTS plano_estagio       CASCADE;
DROP TABLE IF EXISTS estagio             CASCADE;
DROP TABLE IF EXISTS supervisor          CASCADE;
DROP TABLE IF EXISTS professor_orientador CASCADE;
DROP TABLE IF EXISTS professor_prae      CASCADE;
DROP TABLE IF EXISTS representante_uce   CASCADE;
DROP TABLE IF EXISTS aluno               CASCADE;
DROP TABLE IF EXISTS pessoa              CASCADE;
DROP TABLE IF EXISTS unidade_concedente  CASCADE;
DROP TABLE IF EXISTS curso               CASCADE;
DROP TABLE IF EXISTS cidade              CASCADE;

-- ============================================================
-- 1. DOMÍNIOS / TABELAS DE SUPORTE
-- ============================================================

CREATE TABLE cidade (
    id_cidade   SERIAL      PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    uf          CHAR(2)      NOT NULL
);

CREATE TABLE curso (
    id_curso    SERIAL       PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL UNIQUE
);

-- ============================================================
-- 2. PESSOA  (base para todos os papéis humanos)
-- ============================================================

CREATE TABLE pessoa (
    cpf         CHAR(11)     PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    telefone    VARCHAR(20),
    celular     VARCHAR(20)
    senha       VARCHAR(50)
);
COMMENT ON TABLE pessoa IS
  'Tabela base para todas as pessoas físicas do sistema. CPF é a chave universal.';

-- ============================================================
-- 3. PAPÉIS  (relações 1:1 com pessoa via CPF)
-- ============================================================

-- 3a. Aluno
CREATE TABLE aluno (
    cpf         CHAR(11)     PRIMARY KEY
                             REFERENCES pessoa(cpf) ON DELETE RESTRICT,
    ra          VARCHAR(20)  NOT NULL UNIQUE,
    id_curso    INT          NOT NULL REFERENCES curso(id_curso)
);
COMMENT ON TABLE aluno IS
  'Relação 1:1 com pessoa via CPF. RA é identificador acadêmico único.';

-- 3b. Professor orientador
CREATE TABLE professor_orientador (
    cpf         CHAR(11)     PRIMARY KEY
                             REFERENCES pessoa(cpf) ON DELETE RESTRICT,
    departamento VARCHAR(100)
);
COMMENT ON TABLE professor_orientador IS
  'Relação 1:1 com pessoa via CPF. Email herdado de pessoa.';

-- 3c. Professor PRAE (coordenador de estágios do curso)
CREATE TABLE professor_prae (
    cpf         CHAR(11)     PRIMARY KEY
                             REFERENCES pessoa(cpf) ON DELETE RESTRICT,
    id_curso    INT          NOT NULL REFERENCES curso(id_curso)
);

-- ============================================================
-- 4. UNIDADE CONCEDENTE e SUPERVISOR
-- ============================================================

CREATE TABLE unidade_concedente (
    cnpj        CHAR(14)     PRIMARY KEY,
    nome        VARCHAR(150) NOT NULL,
    telefone    VARCHAR(20),
    endereco    VARCHAR(200),
    id_cidade   INT          NOT NULL REFERENCES cidade(id_cidade)
);
COMMENT ON TABLE unidade_concedente IS
  'Empresa/organização que oferece a vaga. CNPJ como chave natural.';

-- Supervisor: 1:1 com pessoa, vinculado a uma unidade concedente
CREATE TABLE supervisor (
    cpf             CHAR(11)    PRIMARY KEY
                                REFERENCES pessoa(cpf) ON DELETE RESTRICT,
    cargo           VARCHAR(100) NOT NULL,
    cnpj_uce        CHAR(14)    NOT NULL
                                REFERENCES unidade_concedente(cnpj)
);
COMMENT ON TABLE supervisor IS
  'Relação 1:1 com pessoa via CPF. Supervisor pertence a uma unidade concedente.';

-- Representante legal da UCE (para assinar termos)
CREATE TABLE representante_uce (
    cpf             CHAR(11)    PRIMARY KEY
                                REFERENCES pessoa(cpf) ON DELETE RESTRICT,
    cargo           VARCHAR(100) NOT NULL,
    cnpj_uce        CHAR(14)    NOT NULL
                                REFERENCES unidade_concedente(cnpj),
    data_inicio     DATE        NOT NULL,
    data_fim        DATE
);

-- ============================================================
-- 5. ESTÁGIO  (tabela central)
-- ============================================================

CREATE TABLE estagio (
    id_estagio          SERIAL      PRIMARY KEY,
    numero_termo        VARCHAR(20) NOT NULL UNIQUE,
    tipo                VARCHAR(20) NOT NULL
                        CHECK (tipo IN ('OBRIGATORIO', 'NAO_OBRIGATORIO')),

    -- Partes envolvidas
    cpf_aluno           CHAR(11)    NOT NULL REFERENCES aluno(cpf),
    cnpj_uce            CHAR(14)    NOT NULL REFERENCES unidade_concedente(cnpj),
    cpf_supervisor      CHAR(11)    NOT NULL REFERENCES supervisor(cpf),
    cpf_orientador      CHAR(11)    NOT NULL REFERENCES professor_orientador(cpf),

    -- Vigência
    data_inicio         DATE        NOT NULL,
    data_termino        DATE        NOT NULL,

    -- Remuneração e seguro
    valor_bolsa         NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    beneficios          VARCHAR(200),
    seguro_apolice      VARCHAR(50),
    seguradora          VARCHAR(100),

    -- Aprovação e processo
    aprovado            BOOLEAN     NOT NULL DEFAULT FALSE,
    processo_sei        VARCHAR(50),

    -- Nota da apresentação final
    nota_apresentacao   NUMERIC(4,2)
                        CHECK (nota_apresentacao BETWEEN 0 AND 10),

    CONSTRAINT datas_validas CHECK (data_termino > data_inicio)
);
COMMENT ON TABLE estagio IS
  'Tabela central. Um aluno pode ter vários estágios (em UCEs diferentes ou períodos distintos).';

-- ============================================================
-- 6. PLANO DE ESTÁGIO
--    Um estágio pode ter vários planos ao longo do tempo
--    (mudança de horário, atividades etc.)
-- ============================================================

CREATE TABLE plano_estagio (
    id_plano        SERIAL      PRIMARY KEY,
    id_estagio      INT         NOT NULL REFERENCES estagio(id_estagio) ON DELETE CASCADE,
    data_inicio     DATE        NOT NULL,
    data_fim        DATE,           -- NULL = plano ainda vigente
    carga_horaria_semanal INT   NOT NULL,
    carga_horaria_total   INT   NOT NULL,
    atividades      TEXT,
    objetivos       TEXT,
    resultados_esperados TEXT,

    CONSTRAINT plano_datas_validas CHECK (data_fim IS NULL OR data_fim > data_inicio)
);
COMMENT ON TABLE plano_estagio IS
  'Cada registro representa um período distinto de condições de estágio '
  '(ex.: mudança de horário). Histórico completo preservado.';

-- 6a. Horários semanais vinculados ao plano (não ao estágio diretamente)
CREATE TABLE plano_horario (
    id_plano        INT         NOT NULL REFERENCES plano_estagio(id_plano) ON DELETE CASCADE,
    dia_semana      VARCHAR(15) NOT NULL
                    CHECK (dia_semana IN
                      ('SEGUNDA','TERCA','QUARTA','QUINTA','SEXTA','SABADO')),
    hora_inicio     TIME        NOT NULL,
    hora_fim        TIME        NOT NULL,

    PRIMARY KEY (id_plano, dia_semana),
    CONSTRAINT horario_valido CHECK (hora_fim > hora_inicio)
);
COMMENT ON TABLE plano_horario IS
  'Horários semanais de um plano específico. Vinculado ao plano, não ao estágio.';

-- ============================================================
-- 7. DOCUMENTOS DO ESTÁGIO  (armazenamento em BYTEA/BLOB)
--
--    Tipos previstos:
--      PLANO_ESTAGIO        — plano de estágio assinado
--      RELATORIO_PARCIAL_1  — relatório parcial 1 (aluno)
--      RELATORIO_PARCIAL_2  — relatório parcial 2
--      RELATORIO_PARCIAL_3  — relatório parcial 3
--      RELATORIO_PARCIAL_4  — relatório parcial 4
--      RELATORIO_SUPERVISOR — avaliação do supervisor
--      RELATORIO_VISITA     — relatório de visita do orientador
--      RELATORIO_FINAL      — relatório final do aluno
--      SINTESE_AVALIACOES   — síntese consolidada das avaliações
-- ============================================================

CREATE TABLE documento_estagio (
    id_documento    SERIAL      PRIMARY KEY,
    id_estagio      INT         NOT NULL REFERENCES estagio(id_estagio) ON DELETE CASCADE,
    tipo_documento  VARCHAR(30) NOT NULL
                    CHECK (tipo_documento IN (
                        'PLANO_ESTAGIO',
                        'RELATORIO_PARCIAL_1',
                        'RELATORIO_PARCIAL_2',
                        'RELATORIO_PARCIAL_3',
                        'RELATORIO_PARCIAL_4',
                        'RELATORIO_SUPERVISOR',
                        'RELATORIO_VISITA',
                        'RELATORIO_FINAL',
                        'SINTESE_AVALIACOES'
                    )),
    nome_arquivo    VARCHAR(200) NOT NULL,
    conteudo        BYTEA       NOT NULL,  -- arquivo em binário
    data_upload     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Um estágio só pode ter um documento de cada tipo
    UNIQUE (id_estagio, tipo_documento)
);
COMMENT ON TABLE documento_estagio IS
  'Armazena os documentos obrigatórios do estágio em formato binário (BYTEA). '
  'Cada tipo de documento ocorre no máximo uma vez por estágio.';

-- ============================================================
-- 8. ÍNDICES AUXILIARES
-- ============================================================

CREATE INDEX idx_estagio_aluno      ON estagio(cpf_aluno);
CREATE INDEX idx_estagio_uce        ON estagio(cnpj_uce);
CREATE INDEX idx_estagio_orientador ON estagio(cpf_orientador);
CREATE INDEX idx_plano_estagio      ON plano_estagio(id_estagio);
CREATE INDEX idx_doc_estagio        ON documento_estagio(id_estagio);
CREATE INDEX idx_aluno_curso        ON aluno(id_curso);

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
