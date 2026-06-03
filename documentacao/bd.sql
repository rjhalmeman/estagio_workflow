-- public.plano_estagio definition

-- Drop table

-- DROP TABLE public.plano_estagio;

CREATE TABLE public.plano_estagio ( id serial4 NOT NULL, aluno_nome varchar(255) NOT NULL, aluno_matricula varchar(50) NOT NULL, aluno_curso varchar(255) NULL, empresa_nome varchar(255) NULL, empresa_cnpj varchar(25) NULL, data_inicio date NULL, data_termino date NULL, carga_horaria int4 NULL, tipo_estagio varchar(50) NULL, data_inclusao timestamp DEFAULT CURRENT_TIMESTAMP NULL, CONSTRAINT plano_estagio_pkey PRIMARY KEY (id));
