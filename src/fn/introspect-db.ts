import { PgrRlsPolicy } from '../d'
import {doQuery} from '../pg-client'
import buildQuery from '../pg11IntrospectionQuery'

async function introspectDb() {
  const sql = await buildQuery('soro, soro_auth, soro_auth_app, ucs, leaf, lf_hist, prd_fn, evt')
  const introspection = (await doQuery(sql)).rows
  const mappedSchemaTree = introspection[0].schema_tree
  .map(
    (s: any) => {
      return {
        schemaName: s.schema_name,
        schemaTables: s.schema_tables
        .map(
          (t: any) => {
            const policies = introspection[0].rls_policies.filter((p: any) => p.schemaname === s.schema_name && p.tablename === t.table_name)
            return {
              schemaName: t.table_schema,
              tableName: t.table_name,
              tableColumns: t.table_columns,
              existingPolicies: policies
            }
          }
        ),
        schemaViews: s.schema_views.map(
          (t: any) => {
            const policies = introspection[0].rls_policies.filter((p: any) => p.schemaname === s.schema_name && p.tablename === t.table_name)
            return {
              schemaName: t.table_schema,
              tableName: t.table_name,
              tableColumns: t.table_columns,
              existingPolicies: policies
            }
          }
        ),
        schemaFunctions: s.schema_functions
      }
    }
  )
  const existingPolicies = await sortExistingPolicies(introspection[0].rls_policies)
  const existingPolicyTemplates = await getExistingPolicyTemplates(introspection[0].rls_policies)

  return {
    schemaTree: mappedSchemaTree,
    existingPolicies: existingPolicies,
    existingPolicyTemplates: existingPolicyTemplates,
    enabledRoles: introspection[0].enabled_roles
  }
}

async function getExistingPolicyTemplates(rlsPolicies: PgrRlsPolicy[]) {
  return rlsPolicies
    .reduce(
      (a: PgrRlsPolicy[], p: PgrRlsPolicy) => {
        const exists = a.find((ep) => {
          return ep.cmd === p.cmd && 
            ep.permissive === p.permissive && 
            // ep.policyname === p.policyname && 
            ep.qual === p.qual && 
            ep.with_check === p.with_check && 
            ep.roles.join(",") === p.roles.join(",")
        })
        return exists ? a : [
          ...a,
          {
            ...p,
            schemaname: 'SCHEMANAME',
            tablename: 'TABLENAME'
          }
        ]
      }, []
    )
}

async function sortExistingPolicies(rlsPolicies: PgrRlsPolicy[]) {
  return rlsPolicies
    .reduce(
      (a: any, p: PgrRlsPolicy) => {

        const existing = Object.keys(a)
          .find(
            (key: string) => {
              const ep = a[key].assignments[0]
              return ep.cmd === p.cmd && 
                ep.permissive === p.permissive && 
                ep.qual === p.qual && 
                ep.with_check === p.with_check && 
                ep.roles.join(",") === p.roles.join(",")
            }
          )
        
        return existing ? {
          ...a,
          [existing]: {
            count: a[existing].count + 1,
            assignments: [...a[existing].assignments, p]
          }
         } : {
          ...a,
          [p.policyname]: {
            count: 1,
            assignments: [p]
          }
        }
      }, {}
    )
}

export {getExistingPolicyTemplates, introspectDb}