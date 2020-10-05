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

# graphile starter 
create a database with the graphile-starter schema located here: https://github.com/graphile/starter/blob/main/data/schema.sql
```
npx pg-rls-util init -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/[DB_NAME] -s app_hidden,app_private,app_public -p graphile-starter

npx pg-rls-util generate -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/[DB_NAME] -s app_hidden,app_private,app_public -p graphile-starter

npx pg-rls-util release -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/[DB_NAME] -s app_hidden,app_private,app_public -p graphile-starter
```
