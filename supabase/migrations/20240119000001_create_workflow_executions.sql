create table workflow_executions (
  id uuid default uuid_generate_v4() primary key,
  workflow_id uuid references workflows(id),
  user_id uuid references auth.users(id),
  execution_id text not null,
  status text not null,
  results jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table workflow_executions enable row level security;

create policy "Users can view their own workflow executions"
  on workflow_executions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workflow executions"
  on workflow_executions for insert
  with check (auth.uid() = user_id); 
