import * as Mustache from 'mustache'
import loadConfig from '../../../../config'
import {PgrRoleSet, PgrFunction, PgrFunctionSecurityProfile, PgrSchema, PgrRole, PgrFunctionSecurityProfileAssignmentSet, PgrMasterFunctionScriptSet, PgrSchemaFunctionProfileAssignmentSet, PgrSchemaFunctionScriptSet, PgrFunctionScript, PgrConfig, PgrFunctionSecurityProfileSet, PgrDbIntrospection} from "../../../../d"
let config: PgrConfig

function computeFunctionSignature(fn: PgrFunction) {
  const schemaName = fn.functionSchema
  const DEFAULT = ' DEFAULT'

  const signatureArgumentDataTypes = fn.argumentDataTypes
  // const signatureArgumentDataTypes = fn.isFromExtension ? fn.argumentDataTypes : fn.argumentDataTypes
  // .split(',')
  // .map(adt => adt.replace('timestamp with time zone', 'timestamptz'))
  // .map(adt => adt.trim().split(' ').slice(1).join(' '))
  // .map(arg => (arg.indexOf(DEFAULT) === -1 ? arg : arg.slice(0, arg.indexOf(DEFAULT))))
  // .join(',')

  const functionSignature = fn ? `${schemaName}.${fn.functionName} (${signatureArgumentDataTypes})` : `{{functionSchema}}.{{functionName}} ({{signatureArgumentDataTypes}})`

  return functionSignature
}

function computeFunctionPolicy (fn: PgrFunction, functionSecurityProfile: PgrFunctionSecurityProfile, roles: PgrRoleSet) {
  if (fn.isFromExtension) return `----  function ${fn.functionName} is from an extension.  no grants are affected.`

  const schemaName = fn.functionSchema
  const revokeRolesList = ['public', ...roles.dbUserRoles.map((r:PgrRole) => r.roleName)].join(',\n       ')
  const roleGrant = functionSecurityProfile.grants.EXECUTE.length > 0 ? {
    roles: functionSecurityProfile.grants.EXECUTE.join(', ')
    ,action: "EXECUTE"
    ,schemaName: schemaName
    ,functionName: fn.functionName
  } : null

  const functionSignature = computeFunctionSignature(fn)

  const templateVariables = {
    schemaName: schemaName,
    functionName: fn.functionName,
    functionSecurityProfileName: functionSecurityProfile.name,
    revokeRolesList: revokeRolesList,
    roleGrant: roleGrant,
    functionSignature: functionSignature
  }

  return Mustache.render(
    config.scriptTemplates.functionPolicyTemplate,
    templateVariables
  )

}

async function computeSchemaFunctionScripts(schemaFunctionAssignmentSet: PgrFunctionSecurityProfileAssignmentSet, securityProfiles: PgrFunctionSecurityProfile[], roles: PgrRoleSet, introspection: PgrDbIntrospection): Promise<PgrSchemaFunctionScriptSet>{
  const p = Object.keys(schemaFunctionAssignmentSet.functionAssignments)
    // .filter(k => k === 'link_or_register_user')
    .map(
      async (functionName: string) => {
        const fn = introspection.schemaTree
          .find((s: PgrSchema) => s.schemaName === schemaFunctionAssignmentSet.schemaName).schemaFunctions
          .find((t: PgrFunction) => t.functionName === functionName)
        const securityProfile = securityProfiles.find((sp: PgrFunctionSecurityProfile) => sp.name === schemaFunctionAssignmentSet.functionAssignments[functionName])
        if (!securityProfile) throw new Error(`No securityProfile: ${schemaFunctionAssignmentSet.functionAssignments[functionName]}`)
        const functionScript = fn ?
          await computeFunctionPolicy(fn, securityProfile, roles) :
          `-- Function does not exist in introspection for function ${schemaFunctionAssignmentSet.schemaName}.${functionName}`
        return {
          functionName: functionName,
          functionScript: functionScript
        }
      }
    )
    const functionScripts: PgrFunctionScript[] = await Promise.all(p)
    return {
      schemaName: schemaFunctionAssignmentSet.schemaName,
      functionScripts: functionScripts
    }
  }

async function computeAllSchemaFunctionScripts(functionSecurityProfileAssignments: PgrSchemaFunctionProfileAssignmentSet[], securityProfiles: PgrFunctionSecurityProfile[], roleSet: PgrRoleSet, introspection: PgrDbIntrospection): Promise<PgrMasterFunctionScriptSet> {
  const p = functionSecurityProfileAssignments
  .map(
    async (schemaAssignments: PgrSchemaFunctionProfileAssignmentSet) => {
      const schemaFunctionScriptSet = await computeSchemaFunctionScripts(schemaAssignments, securityProfiles, roleSet, introspection)
      return schemaFunctionScriptSet
    }
  );

  const schemaFunctionScriptSets = await Promise.all(p)
  return {
    schemaFunctionScriptSets: schemaFunctionScriptSets
  }
}

async function computeAllFunctionScripts(introspection: PgrDbIntrospection): Promise<PgrMasterFunctionScriptSet>{
  config = await loadConfig()

  const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = config.functionSecurityProfileSet

  const computedMasterScriptSet = await computeAllSchemaFunctionScripts(config.functionSecurityProfileAssignments,functionSecurityProfileSet.functionSecurityProfiles,config.roleSet,introspection)

  return computedMasterScriptSet
}



export default computeAllFunctionScripts
