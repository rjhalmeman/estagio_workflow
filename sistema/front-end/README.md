# Estágio System - Front-end

Este é o front-end do projeto **Estágio System**, construído usando **React + TypeScript + Vite**. 

---

## Arquitetura e Estrutura

O projeto segue estritamente a metodologia **Atomic Design** e regras globais de componentização e performance:

- **Atomic Design:**
  - **Átomos (`src/components/atoms`)**: Elementos visuais indivisíveis, como `Button` e `Input`.
  - **Moléculas (`src/components/molecules`)**: Pequenos grupos de átomos que atuam juntos.
  - **Organismos (`src/components/organisms`)**: Componentes complexos que formam seções distintas da interface, como `Header` e `Sidebar`.
  - **Templates (`src/components/templates`)**: Estrutura geral de layout que organiza os componentes de página (ex: `DashboardLayout`).
  - **Páginas (`src/pages`)**: Telas completas que são renderizadas a partir dos templates.

- **Performance & Code Splitting:**
  - As páginas principais são carregadas de forma assíncrona usando **`React.lazy`** e **`Suspense`** para diminuir o tamanho do bundle inicial.
  - Nenhum componente ou arquivo deve ultrapassar o limite de **200 linhas**, mantendo funções abaixo de **30 linhas**.

- **Estilização Restrita:**
  - Estilização pura feita com **Vanilla CSS** e **Design Tokens** em `src/styles/tokens/colors.css`.
  - Não são utilizadas sombras ou bordas nos elementos interativos (como inputs e botões).
  - Limite estrito de peso de fontes até **semi-bold (600)**.
  - Suporte nativo e automático a **Modo Escuro / Modo Claro** (via CSS Variables de preferência do sistema ou chaveamento manual no Header).

---

## Cadastro de Estágio (Wizard)

A tela de cadastro de estágio foi estruturada em um assistente (Wizard) de 4 etapas:
1. **Dados do Aluno**: Informações pessoais, de contato e curso (com campos obrigatórios, máscaras de telefone e validação de e-mail).
2. **Horários**: Grade de horários semanais organizada em um **grid responsivo de 3 colunas** no desktop com divisórias verticais e horizontais (bordas), que se ajusta automaticamente para uma lista vertical de coluna única em dispositivos menores.
3. **Dados da Empresa**: Detalhes da organização concedente, vigência do estágio e carga horária.
4. **Professor**: Cadastro do orientador acadêmico.

### 📋 Validações e Navegação
- **Máscaras e Restrições Numéricas**: Inputs de Matrícula, Carga Horária e Ramal bloqueiam a digitação de letras e caracteres não numéricos em tempo real. Telefones e horários são mascarados dinamicamente.
- **Limites de Caracteres**: Configurado `maxLength` em todos os campos de texto.
- **Navegação Inteligente por Etapas**: O usuário pode clicar diretamente nos passos (Stepper) ou nos botões de avançar/voltar. Ao clicar para avançar (ou ir para um passo futuro), o sistema executa a validação da etapa atual em cascata, bloqueando a transição se houver campos incorretos e exibindo mensagens de erro abaixo de cada input. O retorno para etapas anteriores já validadas é livre.

---

## Como Iniciar

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *O front-end estará acessível em `http://localhost:5173`.*

3. **Verifique a integridade dos tipos TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

---

## Comunicação com a API

As requisições estão centralizadas na pasta `src/services/api.ts` e apontam para a URL base da API do Express local (`http://localhost:3001/api`).
