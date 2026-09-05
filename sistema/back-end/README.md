# Backend - Sistema de Gerenciamento de Estágios (UTFPR)

Este é o backend do Sistema de Gerenciamento de Estágios, construído com Node.js, Express, TypeScript, Prisma ORM e PostgreSQL.

---

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [PostgreSQL](https://www.postgresql.org/) (com um banco de dados criado para o projeto)
- Gerenciador de pacotes `npm` (incluso com o Node.js)

---

## Configuração do Ambiente

1. Navegue até o diretório do backend se ainda não estiver nele:
   ```bash
   cd estagio_workflow/sistema/back-end
   ```

2. Duplique o arquivo de variáveis de ambiente `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

3. Abra o arquivo `.env` e configure as variáveis de acordo com seu ambiente:
   ```env
   PORT=3001
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
   NODE_ENV=development
   ```
   *Substitua `usuario`, `senha`, `localhost`, `5432` e `nome_do_banco` pelas credenciais do seu banco de dados PostgreSQL.*

---

## Instalação e Execução

### 1. Instalar as Dependências
Execute o comando abaixo para instalar todas as dependências do projeto. Isso também executará o gatilho `postinstall` para gerar o cliente do Prisma.
```bash
npm install
```

### 2. Configurar o Banco de Dados (Prisma)
Com as credenciais corretas configuradas no `.env`, execute as migrações para criar as tabelas no banco de dados:
```bash
npx prisma migrate dev
```
*(Caso queira apenas sincronizar o schema sem criar histórico de migrations em ambiente de desenvolvimento, você pode usar `npx prisma db push`).*

### 3. Popular o Banco de Dados (Seed)
Para inserir os dados de teste iniciais (aluno de teste, professores e empresa de teste), execute o script de semente:
```bash
npx ts-node src/seed.ts
```

### 4. Testar a Conexão com o Banco de Dados (Opcional)
Para garantir que o backend está conseguindo se comunicar perfeitamente com o PostgreSQL, você pode executar o script de teste de conexão:
```bash
npx ts-node src/test-db.ts
```

### 5. Visualizar e Gerenciar Tabelas (Prisma Studio)
Para visualizar, inserir e gerenciar os dados das tabelas do banco de dados graficamente no navegador, execute:
```bash
npx prisma studio
```
Por padrão, a interface web do Prisma Studio estará disponível em **`http://localhost:5555`** (ou na porta informada no terminal).

### 6. Iniciar o Servidor de Desenvolvimento
Inicie o servidor local em modo de desenvolvimento (com recarregamento automático ao alterar arquivos):
```bash
npm run dev
```
O servidor estará ativo em: **`http://localhost:3001`** (ou na porta configurada no `.env`).
A rota base da API será: **`http://localhost:3001/api`**.

---

## Build para Produção

Se precisar gerar o bundle compilado para produção:

1. Compile o TypeScript para JavaScript:
   ```bash
   npm run build
   ```
2. Execute o servidor de produção a partir do diretório `/dist`:
   ```bash
   npm start
   ```

---

## Scripts Disponíveis no `package.json`

- `npm run dev`: Executa o servidor de desenvolvimento utilizando `ts-node-dev`.
- `npm run build`: Compila os arquivos TypeScript (`src/`) para JavaScript em `dist/`.
- `npm start`: Inicia a aplicação compilada a partir da pasta `dist/`.
- `npx prisma generate`: Regenera o cliente do Prisma com base no arquivo `schema.prisma`.
