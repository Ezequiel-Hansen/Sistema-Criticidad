
create table if not exists public.area(
  id uuid primary key default gen_random_uuid(),
  nombre_area varchar(30) not null,
  planta_area varchar(30) not null
);

create table if not exists public.maquina(
  id uuid primary key default gen_random_uuid(),
  cod_universal varchar(35) not null,
  nombre_equipo varchar(30) not null,
  id_area uuid,
  foreign key (id_area) references public.area(id)
);

create table if not exists public.activos (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  freq_score smallint not null check (freq_score in (1, 3, 5, 7, 10)),
  safety_score smallint not null check (safety_score in (1, 3, 5, 7, 10)),
  environment_score smallint not null check (environment_score in (1, 3, 5, 7, 10)),
  production_score smallint not null check (production_score in (1, 3, 5, 7, 10)),
  created_at timestamptz not null default now(),
  verify boolean default false
);

create table if not exists public.activo_maquina (
  activo_id uuid references public.activos(id) on delete cascade,
  maquina_id uuid references public.maquina(id) on delete cascade,
  primary key (activo_id, maquina_id)
);


-- ------------------------------------------------------------
-- 2. Row Level Security
-- ------------------------------------------------------------
alter table public.maquina enable row level security;
alter table public.area enable row level security;
alter table public.activos enable row level security;
alter table public.activo_maquina enable row level security;

create policy "editar solo si no esta verificado, o si es el autorizado"
on public.activos
for update
using (
  verify = false
  or auth.jwt() ->> 'email' = 'ezequielhansen.2012@gmail.com'
)
with check (
  verify = false
  or auth.jwt() ->> 'email' = 'ezequielhansen.2012@gmail.com'
);

create policy "usuarios autenticados pueden crear activos"
on public.activos
for insert
with check (true);

-- Lectura pública: cualquiera puede leer
create policy "lectura publica"
  on public.activos for select
  to anon, authenticated
  using (true);

-- Escritura protegida: solo usuarios autenticados
create policy "escritura autorizada insert"
  on public.activos for insert
  to authenticated
  with check (true);

create policy "escritura autorizada update"
  on public.activos for update
  to authenticated
  using (true) with check (true);

create policy "escritura autorizada delete"
  on public.activos for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- RLS: activo_maquina
-- ------------------------------------------------------------

create policy "lectura publica activo_maquina"
  on public.activo_maquina for select
  to anon, authenticated
  using (true);

create policy "escritura autorizada activo_maquina"
  on public.activo_maquina for all
  to authenticated
  using (true) with check (true);

-- ------------------------------------------------------------
-- RLS: maquina
-- ------------------------------------------------------------
create policy "lectura publica maquina"
  on public.maquina for select
  to anon, authenticated
  using (true);

create policy "escritura autorizada maquina"
  on public.maquina for all
  to authenticated
  using (true) with check (true);

-- ------------------------------------------------------------
-- RLS: area
-- ------------------------------------------------------------
create policy "lectura publica area"
  on public.area for select
  to anon, authenticated
  using (true);

create policy "escritura autorizada area"
  on public.area for all
  to authenticated
  using (true) with check (true);



-- Políticas para maquina
create policy "lectura publica maquina"
  on public.maquina for select
  to anon, authenticated
  using (true);

create policy "escritura autorizada maquina"
  on public.maquina for all
  to authenticated
  using (true) with check(true);

-- Políticas para area
create policy "lectura publica area"
  on public.area for select
  to anon, authenticated
  using (true);

create policy "escritura autorizada area"
  on public.area for all
  to authenticated
  using (true) with check(true);

-- ------------------------------------------------------------
-- 3. Seed: equipos iniciales
-- ------------------------------------------------------------
insert into public.activos (name, freq_score, safety_score, environment_score, production_score) values
  ('Extractor de aire auxiliar', 3, 3, 3, 3),
  ('Bomba de agua de proceso', 5, 5, 3, 5),
  ('Motor ventilador principal', 5, 7, 5, 7),
  ('Compresor crítico de planta', 10, 7, 5, 10)
on conflict do nothing;

-- ------------------------------------------------------------
-- 4. Vista reporte: criticidad por activo (PR-MNT-001)
-- ------------------------------------------------------------
create or replace view public.v_reporte_criticidad_activos as
select
  id,
  name,
  freq_score,
  safety_score,
  environment_score,
  production_score,
  freq_score * greatest(safety_score, environment_score, production_score) as score,
  case
    when safety_score = 10 or environment_score = 10 or production_score = 10 then 'caso_especial'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 25 then 'baja'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 49 then 'media'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 80 then 'alta'
    else 'critica'
  end as zona,
  case
    when freq_score * greatest(safety_score, environment_score, production_score) <= 25 then 'Correctivo'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 49 then 'Preventivo'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 80 then 'Predictivo'
    else 'RCM / Rediseño'
  end as estrategia,
  case
    when safety_score = 10 or environment_score = 10 or production_score = 10 then '#D14343'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 25 then '#1FA97A'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 49 then '#D9A22B'
    when freq_score * greatest(safety_score, environment_score, production_score) <= 80 then '#E0733F'
    else '#D14343'
  end as color,
  (safety_score = 10 or environment_score = 10 or production_score = 10 or
   freq_score * greatest(safety_score, environment_score, production_score) > 80) as es_critico,
  created_at
from public.activos
order by freq_score * greatest(safety_score, environment_score, production_score) desc, name;