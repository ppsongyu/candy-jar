-- 克劳德的记忆库：在 Supabase 后台 → SQL Editor 里整段粘贴，点 Run，跑一次就行。
create table if not exists claude_memory (
  id          bigint generated always as identity primary key,
  kind        text not null default 'memory',   -- memory / handoff / summary / readme
  tag         text,                              -- 她 / 我们 / 我 / 约定
  title       text,
  content     text not null,
  pinned      boolean not null default false,
  archived    boolean not null default false,
  note        text,                              -- 归档的原因
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists claude_memory_kind_idx on claude_memory (kind, archived, created_at desc);

-- 打开行级安全、不加任何规则：网页和别人都读不到，只有连接器（用服务密钥）能读写。
alter table claude_memory enable row level security;
