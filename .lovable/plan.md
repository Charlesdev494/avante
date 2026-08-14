## Objetivo

Disponibilizar o guia A.V.A.N.T.E. diretamente dentro do aplicativo, para que qualquer médico possa abrir pelo navegador, sem precisar baixar PDF.

## O que será criado

### 1. Nova rota `/manual`

Arquivo `src/routes/manual.tsx` com o conteúdo completo do guia em HTML/React, dividido nas mesmas 8 seções do PDF:

1. O que é o A.V.A.N.T.E.
2. Como acessar (e selecionar seu nome)
3. Cadastrando um paciente (passo a passo)
4. Instrumentos disponíveis (tabela com EVA, Mapa, PCS, NDI, ODI, etc.)
5. Enviando o link ao paciente
6. Acompanhando a evolução (tela inicial, ficha, lixeira)
7. Boas práticas no uso clínico
8. Suporte e feedback

A página usará o `ClinicLayout` (cabeçalho e seleção de médico já existentes), tipografia legível em celular e desktop, com sumário no topo e âncoras para cada seção.

### 2. Link no menu

Adicionar no `ClinicLayout` (header) um novo botão **"Manual"** ao lado de **"Pacientes"**, com ícone de livro (`BookOpen` do lucide-react). Aparece tanto no desktop quanto no celular.

### 3. Card de destaque na home

Na tela inicial (`src/routes/index.tsx`), incluir um pequeno aviso/card "Novo: Manual de uso disponível" com link para `/manual`, para que os médicos notem na primeira visita.

## Notas técnicas

- O PDF gerado anteriormente continua disponível em `/mnt/documents/` para quem preferir baixar — não será removido.
- Rota pública (sem autenticação, igual ao restante do app de testes).
- Conteúdo em português, com a mesma linguagem e exemplos do PDF.
- Sem mudanças de banco de dados ou backend.

## Arquivos afetados

- **Novo:** `src/routes/manual.tsx`
- **Editado:** `src/components/clinic-layout.tsx` (adicionar link "Manual")
- **Editado:** `src/routes/index.tsx` (card de destaque opcional)
