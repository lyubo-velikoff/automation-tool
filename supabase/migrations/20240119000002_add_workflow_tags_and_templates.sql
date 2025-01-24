-- Enable RLS
alter table if exists "public"."workflows" enable row level security;

-- Create workflow_tags table
create table if not exists "public"."workflow_tags" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "color" text not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "workflow_tags_pkey" primary key ("id"),
    constraint "workflow_tags_user_id_fkey" foreign key ("user_id") references auth.users(id) on delete cascade
);

-- Enable RLS on workflow_tags
alter table if exists "public"."workflow_tags" enable row level security;

-- Create workflow_tags_workflows junction table
create table if not exists "public"."workflow_tags_workflows" (
    "workflow_id" uuid not null,
    "tag_id" uuid not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "workflow_tags_workflows_pkey" primary key ("workflow_id", "tag_id"),
    constraint "workflow_tags_workflows_workflow_id_fkey" foreign key ("workflow_id") references workflows(id) on delete cascade,
    constraint "workflow_tags_workflows_tag_id_fkey" foreign key ("tag_id") references workflow_tags(id) on delete cascade
);

-- Enable RLS on workflow_tags_workflows
alter table if exists "public"."workflow_tags_workflows" enable row level security;

-- Create workflow_templates table
create table if not exists "public"."workflow_templates" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "nodes" jsonb not null default '[]'::jsonb,
    "edges" jsonb not null default '[]'::jsonb,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    "updated_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "workflow_templates_pkey" primary key ("id"),
    constraint "workflow_templates_user_id_fkey" foreign key ("user_id") references auth.users(id) on delete cascade
);

-- Enable RLS on workflow_templates
alter table if exists "public"."workflow_templates" enable row level security;

-- Create RLS policies

-- Workflow tags policies
create policy "Users can view their own workflow tags"
    on "public"."workflow_tags"
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own workflow tags"
    on "public"."workflow_tags"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own workflow tags"
    on "public"."workflow_tags"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own workflow tags"
    on "public"."workflow_tags"
    for delete
    using (auth.uid() = user_id);

-- Workflow tags workflows policies
create policy "Users can view their workflow tag associations"
    on "public"."workflow_tags_workflows"
    for select
    using (
        exists (
            select 1 from workflows w
            where w.id = workflow_id
            and w.user_id = auth.uid()
        )
    );

create policy "Users can create workflow tag associations"
    on "public"."workflow_tags_workflows"
    for insert
    with check (
        exists (
            select 1 from workflows w
            where w.id = workflow_id
            and w.user_id = auth.uid()
        )
    );

create policy "Users can delete workflow tag associations"
    on "public"."workflow_tags_workflows"
    for delete
    using (
        exists (
            select 1 from workflows w
            where w.id = workflow_id
            and w.user_id = auth.uid()
        )
    );

-- Workflow templates policies
create policy "Users can view their own workflow templates"
    on "public"."workflow_templates"
    for select
    using (auth.uid() = user_id);

create policy "Users can create their own workflow templates"
    on "public"."workflow_templates"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own workflow templates"
    on "public"."workflow_templates"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own workflow templates"
    on "public"."workflow_templates"
    for delete
    using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists "workflow_tags_user_id_idx" on "public"."workflow_tags" ("user_id");
create index if not exists "workflow_templates_user_id_idx" on "public"."workflow_templates" ("user_id");
create index if not exists "workflow_tags_workflows_workflow_id_idx" on "public"."workflow_tags_workflows" ("workflow_id");
create index if not exists "workflow_tags_workflows_tag_id_idx" on "public"."workflow_tags_workflows" ("tag_id"); 
