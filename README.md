# pg-rls-util
a tool to manage clean generation of postgres row level security scripts
basic usage and to view help:
```
npx pg-rls-util
```
should give you
```
pg-rls-util <command>

Commands:
  pg-rls-util init      initialize the current draft or an entire project
                                                                    [aliases: i]
  pg-rls-util generate  generate all policy scripts                 [aliases: g]
  pg-rls-util release   copy current-draft dir to a new release dir [aliases: r]
  pg-rls-util diff      examine differences between current draft assignments
                        and db introspection                        [aliases: d]
  pg-rls-util merge     merge current-diff into table and function assignments,
                        removing and adding entries as appropriate. [aliases: m]

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
  ```
## graphile starter 
### create db
with the graphile-starter schema located here: https://github.com/graphile/starter/blob/main/data/schema.sql
### init
perform intial db introspection and table assignment.  the default configuration for graphile-starter should do this automatically
```
npx pg-rls-util init -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/[DB_NAME] -s app_hidden,app_private,app_public -p graphile-starter
```
### review files in pg-rls-util-gen/current-draft directory
- roles.json: not really meant to be edited, but it could be
  - graphile_starter
  - graphile_starter_authenticator
  - graphile_starter_visitor
- script-templates.json: currently poorly formatted - json5? - later could be edited, but may remove??
- table-security-profiles.json: meant to be edited
- table-profile-assignments.json: meant to be edited
- function-security-profiles.json: meant to be edited
- function-profile-assignments.json: meant to be edited
### generate
creates the *current-draft/artifacts* directory
```
npx pg-rls-util generate
```
scripts created include:
- one-script-to-rule-them-all.sql
  - all table and function policies across all schemata
  - does NOT affect any existing rls policies
- all-table-policies---all-schemata.sql
- all-function-policies---all-schemata.sql
- create-roles.sql
  - will create any missing roles that are needed
- ownership.sql
  - ensure that all schemas/tables/functions are owned by the proper user
- remove-all-rls.sql
  - optional script that will remove any existing rls policies across the entire database
  - maybe useful if you are trying to apply a new security procedure to an old database

each schema will have rollup scripts as well as function and table scripts to quickly view the impact of a portion of the overall security policy on just one table. 

for instance, *pg-rls-util-gen/current-draft/artifacts/app_public/tableScripts/users.sql*
```
-- to run this sql:
--
-- psql -h 0.0.0.0 -U postgres -d graphile_starter -f /Users/buckfactor/tmp/pg-rls-util-gen/current-draft/artifacts/app_public/tableScripts/users.sql

-- this script is meant to used during development                    ----------------------
-- to give a quick view of the before and after state for table:      app_public.users
begin;
\echo
\echo ........
\echo ....DETAILED TABLE INFORMATION
\echo ........
\d+ app_public.users
\echo
\echo ........
\echo ....SECURITY BEFORE SCRIPT EXECUTES
\echo ........
\dp+ app_public.users

\echo
\echo ........
\echo ....LEAVING ANY EXISTING RLS INTACT
\echo ....this setting can be controlled by table-security-profiles.includeTableRlsRemoval settinc
\echo ........

\echo
\echo ........
\echo ....now executing actual table script
\echo ........

----******
----******  BEGIN TABLE POLICY: app_public.users
----******  TABLE SECURITY PROFILE:  graphile-starter:: app_public.users
----******
----------  REMOVE EXISTING TABLE GRANTS
  revoke all privileges on table app_public.users
  from public,
       graphile_starter_visitor
  ;

----------  ENABLE ROW LEVEL SECURITY: app_public.users
  alter table app_public.users enable row level security;

  drop policy if exists select_all on app_public.users;
  create policy select_all on app_public.users as PERMISSIVE for SELECT to graphile_starter_visitor using (true);
  drop policy if exists update_self on app_public.users;
  create policy update_self on app_public.users as PERMISSIVE for UPDATE to graphile_starter_visitor with check (id = app_public.current_user_id());

----------  CREATE NEW TABLE GRANTS: app_public.users

----------  graphile_starter_visitor
  grant
    SELECT ,
    UPDATE (username, name, avatar_url)
       --  excluded columns for UPDATE: id, created_at, is_admin, is_verified, updated_at
  on table app_public.users to graphile_starter_visitor;


----*******  END TABLE POLICY: app_public.users
--**


\echo
\echo ........
\echo ....SECURITY AFTER SCRIPT EXECUTES
\echo ........
\dp+ app_public.users;
rollback;
```
### release
copy the current draft over to a numbered release.  really, you will also want to also copy one or more of the generated scripts over to your own db change management tool.  but this is a way to snapshot your work as you go along and could be more tightly coupled via automation
```
npx pg-rls-util release
```
### diff
later, when you have added new tables and functions, diff freshly introspects the database to help identify and review differences.
```
npx pg-rls-util diff
```
this will create *current-draft/current-diff.json*
### merge
fold current-diff.json into table-profile-assignments.json and function-profile-assignments.json
```
npx pg-rls-util merge
```
