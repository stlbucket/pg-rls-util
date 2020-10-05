# pg-rls-util
a tool to manage clean generation of postgres row level security scripts
```
npx pg-rls-util init -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/graphile_starter -s app_hidden,app_private,app_public -p graphile-starter
npx pg-rls-util generate -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/graphile_starter -s app_hidden,app_private,app_public -p graphile-starter
npx pg-rls-util release -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/graphile_starter -s app_hidden,app_private,app_public -p graphile-starter
npx pg-rls-util diff -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/graphile_starter -s app_hidden,app_private,app_public -p graphile-starter
npx pg-rls-util merge -x -c postgres://[USER]:[PWD]@[HOST]:[PORT]/graphile_starter -s app_hidden,app_private,app_public -p graphile-starter
```