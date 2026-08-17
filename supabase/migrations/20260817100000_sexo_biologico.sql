-- Sexo biológico do paciente.
--
-- Motivo: o Mapa da Dor tem vistas que dependem da anatomia (corpo inteiro e
-- posição ginecológica). Até aqui a escolha vivia como estado local do
-- componente: não era salva, e a tela de evolução — que renderiza em modo
-- somente leitura, sem o seletor — caía sempre em "feminino". Resultado: a dor
-- marcada por um paciente homem aparecia sobre o desenho feminino na revisão.
--
-- Fica nullable de propósito: paciente cadastrado antes desta coluna não tem
-- como ser adivinhado. O app trata null como "não informado" e pede na ficha.

alter table public.patients
  add column if not exists biological_sex text
  check (biological_sex in ('female', 'male'));

comment on column public.patients.biological_sex is
  'Sexo biológico, usado para escolher as vistas anatômicas do Mapa da Dor. null = não informado.';

-- O paciente responde sem login, só com o token, então a vista dele precisa vir
-- por esta função. Trocar a lista de colunas do RETURNS TABLE muda o tipo de
-- retorno, e nesse caso o Postgres não aceita "create or replace": tem que
-- dropar e recriar — o que também derruba o grant, recolocado no fim.
drop function if exists public.get_assessment_by_token(text);

create function public.get_assessment_by_token(_token text)
returns table (
  id                     uuid,
  patient_id             uuid,
  patient_name           text,
  patient_biological_sex text,
  questionnaire_type     text,
  day                    integer,
  scheduled_date         date,
  responded_at           timestamptz,
  answers                jsonb,
  score                  jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.patient_id, p.name, p.biological_sex, a.questionnaire_type, a.day,
         a.scheduled_date, a.responded_at, a.answers, a.score
  from public.assessments a
  join public.patients p on p.id = a.patient_id
  where a.token = _token
    and p.deleted_at is null;
$$;

revoke all on function public.get_assessment_by_token(text) from public, anon, authenticated;
grant execute on function public.get_assessment_by_token(text) to anon, authenticated;
