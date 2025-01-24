-- Drop indexes
drop index if exists "public"."workflow_tags_workflows_tag_id_idx";
drop index if exists "public"."workflow_tags_workflows_workflow_id_idx";
drop index if exists "public"."workflow_templates_user_id_idx";
drop index if exists "public"."workflow_tags_user_id_idx";

-- Drop policies for workflow templates
drop policy if exists "Users can delete their own workflow templates" on "public"."workflow_templates";
drop policy if exists "Users can update their own workflow templates" on "public"."workflow_templates";
drop policy if exists "Users can create their own workflow templates" on "public"."workflow_templates";
drop policy if exists "Users can view their own workflow templates" on "public"."workflow_templates";

-- Drop policies for workflow tags workflows
drop policy if exists "Users can delete workflow tag associations" on "public"."workflow_tags_workflows";
drop policy if exists "Users can create workflow tag associations" on "public"."workflow_tags_workflows";
drop policy if exists "Users can view their workflow tag associations" on "public"."workflow_tags_workflows";

-- Drop policies for workflow tags
drop policy if exists "Users can delete their own workflow tags" on "public"."workflow_tags";
drop policy if exists "Users can update their own workflow tags" on "public"."workflow_tags";
drop policy if exists "Users can create their own workflow tags" on "public"."workflow_tags";
drop policy if exists "Users can view their own workflow tags" on "public"."workflow_tags";

-- Drop tables (in reverse order of creation to handle dependencies)
drop table if exists "public"."workflow_tags_workflows";
drop table if exists "public"."workflow_templates";
drop table if exists "public"."workflow_tags";

-- Disable RLS on workflows (if you want to completely revert)
alter table if exists "public"."workflows" disable row level security; 
