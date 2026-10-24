-- Applied to Supabase project "portfolio" (gtgjapgcahumlhkkbwhj).
create table public.portfolio_settings (
  id text primary key default 'main' check (id = 'main'),
  layout text not null check (layout in ('grid', 'editorial', 'list')),
  site jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.projects (
  id text primary key,
  position integer not null,
  title text not null check (char_length(title) between 1 and 150),
  tag text not null default '' check (char_length(tag) <= 100),
  description text not null default '' check (char_length(description) <= 3000),
  link text not null default '',
  image text not null default '',
  stack text[] not null default '{}',
  published boolean not null default false,
  updated_at timestamptz not null default now()
);
create index projects_position_idx on public.projects (position);

-- The Node API (service role) is the only client; browsers get no access.
alter table public.portfolio_settings enable row level security;
alter table public.projects enable row level security;
revoke all on public.portfolio_settings, public.projects from anon, authenticated;

create function public.get_portfolio()
returns jsonb
language sql
stable
set search_path = ''
as $$
  select case when s.id is null then null else jsonb_build_object(
    'layout', s.layout,
    'site', s.site,
    'projects', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'title', p.title, 'tag', p.tag, 'description', p.description,
        'link', p.link, 'image', p.image, 'stack', to_jsonb(p.stack),
        'published', p.published) order by p.position)
      from public.projects p), '[]'::jsonb)
  ) end
  from (select 1) d left join public.portfolio_settings s on s.id = 'main';
$$;

-- Replaces settings and projects in a single transaction.
create function public.save_portfolio(content jsonb, create_only boolean default false)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if create_only and exists (select 1 from public.portfolio_settings) then
    raise exception 'Supabase already contains a portfolio. Import cancelled; existing content was not replaced.';
  end if;
  insert into public.portfolio_settings (id, layout, site, updated_at)
  values ('main', content->>'layout', content->'site', now())
  on conflict (id) do update set layout = excluded.layout, site = excluded.site, updated_at = now();

  delete from public.projects
  where id not in (select p->>'id' from jsonb_array_elements(content->'projects') p);

  insert into public.projects (id, position, title, tag, description, link, image, stack, published, updated_at)
  select p->>'id', (ord - 1)::int, p->>'title', p->>'tag', p->>'description', p->>'link', p->>'image',
         array(select jsonb_array_elements_text(p->'stack')), (p->>'published')::boolean, now()
  from jsonb_array_elements(content->'projects') with ordinality as t(p, ord)
  on conflict (id) do update set
    position = excluded.position, title = excluded.title, tag = excluded.tag,
    description = excluded.description, link = excluded.link, image = excluded.image,
    stack = excluded.stack, published = excluded.published, updated_at = now()
  where (public.projects.position, public.projects.title, public.projects.tag, public.projects.description,
         public.projects.link, public.projects.image, public.projects.stack, public.projects.published)
    is distinct from (excluded.position, excluded.title, excluded.tag, excluded.description,
         excluded.link, excluded.image, excluded.stack, excluded.published);
end;
$$;

revoke execute on function public.get_portfolio() from public, anon, authenticated;
revoke execute on function public.save_portfolio(jsonb, boolean) from public, anon, authenticated;
grant execute on function public.get_portfolio() to service_role;
grant execute on function public.save_portfolio(jsonb, boolean) to service_role;
