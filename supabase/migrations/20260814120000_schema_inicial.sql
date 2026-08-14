-- Schema inicial do AVANTE Questionários.
--
-- O projeto nasceu na Lovable, que criava as tabelas direto no Supabase sem
-- versionar nada. Quando o projeto antigo foi apagado, o schema foi junto — o
-- repositório tinha o código, mas não o banco. Esta migration reconstrói o
-- schema a partir de src/integrations/supabase/types.ts e das consultas que o
-- app realmente faz, e passa a ser a fonte da verdade do banco.
--
-- Modelo de acesso:
--   - Médico faz login e enxerga apenas os pacientes que são dele (owner_id).
--   - Paciente NÃO faz login. Ele responde por um link com token, e todo o
--     acesso dele passa pelas funções SECURITY DEFINER no fim do arquivo —
--     as tabelas em si ficam fechadas para quem não está autenticado.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.app_role as enum ('admin', 'user');

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.patients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  birth_date  date,
  phone       text,
  email       text,
  notes       text,
  -- Rótulo de quem cadastrou, mostrado na ficha. É texto livre de propósito:
  -- o app grava o e-mail do médico logado, sem depender de outra tabela.
  doctor_name text not null default 'Médico',
  -- Dono do registro. O default preenche sozinho no insert, por isso o app
  -- não manda esta coluna. Fica NULL em paciente "legado" (criado antes do
  -- login existir), até alguém reivindicar via claim_legacy_patients().
  owner_id    uuid default auth.uid() references auth.users (id) on delete set null,
  -- Lixeira: o app esconde o paciente em vez de apagar, para dar chance de
  -- desfazer. A exclusão definitiva é uma ação separada na tela.
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.assessments (
  id                 uuid primary key default gen_random_uuid(),
  patient_id         uuid not null references public.patients (id) on delete cascade,
  questionnaire_type text not null,
  -- 0, 30 ou 90 — o dia da jornada de dor. Não é enum porque o médico pode
  -- agendar um dia fora do padrão quando quiser.
  day                integer not null,
  scheduled_date     date not null,
  responded_at       timestamptz,
  answers            jsonb,
  score              jsonb,
  -- Segredo do link do paciente. 32 hex = 128 bits, o suficiente para não ser
  -- adivinhável. gen_random_uuid() evita depender da extensão pgcrypto.
  token              text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index patients_owner_id_idx on public.patients (owner_id);
create index patients_deleted_at_idx on public.patients (deleted_at);
create index assessments_patient_id_idx on public.assessments (patient_id);
create index assessments_pending_idx on public.assessments (scheduled_date) where responded_at is null;

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create trigger assessments_set_updated_at
  before update on public.assessments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.patients enable row level security;
alter table public.assessments enable row level security;
alter table public.user_roles enable row level security;

-- Usada nas policies e exposta ao app. SECURITY DEFINER para poder ler
-- user_roles sem cair na RLS da própria tabela (o que causaria recursão).
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Paciente é do médico dono, ou é legado (sem dono) e portanto visível a
-- qualquer médico logado até ser reivindicado.
create policy patients_select on public.patients
  for select to authenticated
  using (owner_id = auth.uid() or owner_id is null);

create policy patients_insert on public.patients
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy patients_update on public.patients
  for update to authenticated
  using (owner_id = auth.uid() or owner_id is null)
  with check (owner_id = auth.uid() or owner_id is null);

create policy patients_delete on public.patients
  for delete to authenticated
  using (owner_id = auth.uid() or owner_id is null);

-- Avaliação segue o acesso do paciente a que pertence.
create policy assessments_all on public.assessments
  for all to authenticated
  using (
    exists (
      select 1 from public.patients p
      where p.id = assessments.patient_id
        and (p.owner_id = auth.uid() or p.owner_id is null)
    )
  )
  with check (
    exists (
      select 1 from public.patients p
      where p.id = assessments.patient_id
        and (p.owner_id = auth.uid() or p.owner_id is null)
    )
  );

-- Cada um enxerga só os próprios papéis; conceder papel é operação de admin,
-- feita pelo painel do Supabase.
create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Acesso do paciente pelo token
--
-- O paciente é anônimo: não tem linha em auth.users e não passa por nenhuma
-- policy acima. Estas funções são a única porta de entrada dele, e cada uma
-- exige o token — que só chega pelo link que o médico enviou.
-- ---------------------------------------------------------------------------

create or replace function public.get_assessment_by_token(_token text)
returns table (
  id                 uuid,
  patient_id         uuid,
  patient_name       text,
  questionnaire_type text,
  day                integer,
  scheduled_date     date,
  responded_at       timestamptz,
  answers            jsonb,
  score              jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.patient_id, p.name, a.questionnaire_type, a.day,
         a.scheduled_date, a.responded_at, a.answers, a.score
  from public.assessments a
  join public.patients p on p.id = a.patient_id
  where a.token = _token
    and p.deleted_at is null;
$$;

-- Os questionários do mesmo dia, para a tela mostrar o progresso ("2 de 5").
create or replace function public.get_day_assessments_by_token(_token text)
returns table (
  questionnaire_type text,
  responded_at       timestamptz,
  answers            jsonb,
  score              jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select irmao.questionnaire_type, irmao.responded_at, irmao.answers, irmao.score
  from public.assessments atual
  join public.patients p on p.id = atual.patient_id
  join public.assessments irmao
    on irmao.patient_id = atual.patient_id
   and irmao.day = atual.day
  where atual.token = _token
    and p.deleted_at is null
  order by irmao.created_at;
$$;

-- O que ainda falta responder naquele dia, para encadear um questionário no
-- outro sem o paciente voltar ao e-mail.
create or replace function public.get_pending_siblings_by_token(_token text)
returns table (
  questionnaire_type text,
  token              text
)
language sql
stable
security definer
set search_path = public
as $$
  select irmao.questionnaire_type, irmao.token
  from public.assessments atual
  join public.patients p on p.id = atual.patient_id
  join public.assessments irmao
    on irmao.patient_id = atual.patient_id
   and irmao.day = atual.day
  where atual.token = _token
    and p.deleted_at is null
    and irmao.id <> atual.id
    and irmao.responded_at is null
  order by irmao.created_at;
$$;

create or replace function public.submit_assessment_by_token(
  _token   text,
  _answers jsonb,
  _score   jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _id uuid;
begin
  -- Não deixa responder por link de paciente que foi para a lixeira.
  select a.id into _id
  from public.assessments a
  join public.patients p on p.id = a.patient_id
  where a.token = _token
    and p.deleted_at is null;

  if _id is null then
    raise exception 'Token inválido ou expirado.';
  end if;

  update public.assessments
     set answers      = _answers,
         score        = _score,
         -- Preserva o instante da primeira resposta se o paciente reenviar.
         responded_at = coalesce(responded_at, now())
   where id = _id;
end;
$$;

-- Vincula à conta atual os pacientes criados antes do login existir.
create or replace function public.claim_legacy_patients()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  _n integer;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado.';
  end if;

  update public.patients
     set owner_id = auth.uid()
   where owner_id is null;

  get diagnostics _n = row_count;
  return _n;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permissões de execução
--
-- Duas camadas de default concedem EXECUTE sozinhas: o Postgres libera para
-- PUBLIC, e a Supabase mantém ALTER DEFAULT PRIVILEGES concedendo a anon e
-- authenticated em tudo que nasce no schema public. Revogar só de PUBLIC não
-- basta — os grants a anon são explícitos e sobrevivem. Por isso o revoke
-- abaixo cita anon e authenticated pelo nome antes de devolver o acesso.
--
-- Importa porque estas funções são SECURITY DEFINER: rodam ignorando a RLS.
-- ---------------------------------------------------------------------------

revoke execute on function
  public.get_assessment_by_token(text),
  public.get_day_assessments_by_token(text),
  public.get_pending_siblings_by_token(text),
  public.submit_assessment_by_token(text, jsonb, jsonb),
  public.claim_legacy_patients(),
  public.has_role(uuid, public.app_role),
  public.set_updated_at()
from public, anon, authenticated;

-- O paciente chega sem login: entra como anon, e só pelo token.
grant execute on function
  public.get_assessment_by_token(text),
  public.get_day_assessments_by_token(text),
  public.get_pending_siblings_by_token(text),
  public.submit_assessment_by_token(text, jsonb, jsonb)
to anon, authenticated;

-- Reivindicar pacientes e consultar papel exigem estar logado.
-- claim_legacy_patients já recusa auth.uid() nulo por conta própria; tirar de
-- anon é a segunda tranca, para o anônimo nem alcançar a função.
grant execute on function
  public.claim_legacy_patients(),
  public.has_role(uuid, public.app_role)
to authenticated;
