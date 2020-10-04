import { ConnectionConfig } from 'pg';

export interface PgrRole {
  roleName: string,
  applicableRoles?: string[]
}

export interface PgrTable {
  schemaName: string,
  tableName: string,
  tableColumns: any[],
  existingPolicies: PgrRlsPolicy[]
}

export interface PgrFunction {
  functionSchema: string,
  functionName: string,
  resultDataType: string,
  argumentDataTypes: string,
  definition: string
}

export interface PgrSchema {
  schemaName: string,
  schemaTables: PgrTable[],
  schemaViews: PgrTable[],
  schemaFunctions: PgrFunction[]
}

export interface PgrRoleSet {
  name: string,
  dbOwnerRole: PgrRole,
  dbAuthenticatorRole: PgrRole,
  dbUserRoles: PgrRole[]
}

export interface PgrRoleGrant {
  roleName: string,
  exclusions?: string[]
}

export interface PgrRoleGrantSet {
  SELECT: PgrRoleGrant[],
  INSERT: PgrRoleGrant[],
  UPDATE: PgrRoleGrant[],
  DELETE: PgrRoleGrant[],
  [key: string]: PgrRoleGrant[] 
}

export interface PgrRlsPolicy {
  cmd: string,
  qual: string | null,
  roles: string[],
  permissive: string,
  policyname: string,
  with_check: string | null,
  schemaName?: string,
  tableName?: string
}

export interface PgrRlsPolicySet {
  SELECT: PgrRlsPolicy[],
  INSERT: PgrRlsPolicy[],
  UPDATE: PgrRlsPolicy[],
  DELETE: PgrRlsPolicy[],
  ALL: PgrRlsPolicy[],
  [key: string]: PgrRlsPolicy[]
}

export interface PgrTableSecurityProfile {
  name: string,
  enableRls: boolean,
  grants: PgrRoleGrantSet,
  policies: PgrRlsPolicySet
}

export type ColumnExclusionSet = string[]
  
export interface PgrTableSecurityProfileSet {
  defaultProfileName: string,
  defaultInsertExclusions: ColumnExclusionSet,
  defaultUpdateExclusions: ColumnExclusionSet,
  tableSecurityProfiles: PgrTableSecurityProfile[]
}

export interface PgrTableAssignment {
  [key: string]: string
}

export interface PgrSchemaTableProfileAssignmentSet {
  schemaName: string,
  tableAssignments: PgrTableAssignment,
  viewAssignments: PgrTableAssignment
}

export interface PgrFunctionAssignment {
  [key: string]: string
}

export interface PgrSchemaFunctionProfileAssignmentSet {
  schemaName: string,
  functionAssignments: PgrFunctionAssignment
}

export interface PgrFunctionRoleGrantSet {
  EXECUTE: string[],
  [key: string]: string[] 
}

export interface PgrFunctionSecurityProfile {
  name: string,
  grants: PgrFunctionRoleGrantSet
}

export interface PgrFunctionSecurityProfileSet {
  defaultProfileName: string,
  functionSecurityProfiles: PgrFunctionSecurityProfile[]
}

export interface PgrFunctionSecurityProfileAssignmentSet {
  schemaName: string,
  functionAssignments: any
}

export interface PgrConnectionInfo {
  dbUser: string
  ,dbPassword: string
  ,dbName: string
  ,dbHost: string
  ,dbPort: string
  ,dbConnectionString: string
}

export interface PgrConfig {
  dbConfig: ConnectionConfig,
  baseDirectory: string,
  currentDraftDirectory: string,
  artifactsDirectory: string,
  releasesDirectory: string,
  roleSet: PgrRoleSet,
  tableSecurityProfileSet: PgrTableSecurityProfileSet,
  functionSecurityProfileSet: PgrFunctionSecurityProfileSet,
  tableSecurityProfileAssignmentSets: PgrSchemaTableProfileAssignmentSet[],
  functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[],
  currentDiff: PgrDiffSummary,
  artifactPaths: PgrArtifactPathSet,
  scriptTemplates: PgrScriptTemplateSet
}

export interface PgrArtifactPathSet {
  tableProfileAssignmentsPath: string,
  tableProfileAssignmentsStagedPath: string,
  tableSecurityProfilesPath: string,
  functionProfileAssignmentsPath: string,
  functionProfileAssignmentsStagedPath: string,
  functionSecurityProfilesPath: string,
  scriptTemplatesPath: string,
  currentDiffPath: string,
  roleSetPath: string,
  oneScriptToRuleThemAllPath: string,
  createRolesPath: string,
  ownershipPath: string,
  removeAllRlsPath: string,
  schemaUsageSqlPath: string
}

export interface PgrDiffSummary {
  tableSecurityRemovals: PgrSchemaTableProfileAssignmentSet[],
  tableSecurityAdditions: PgrSchemaTableProfileAssignmentSet[],
  functionSecurityRemovals: PgrFunctionSecurityProfileAssignmentSet[],
  functionSecurityAdditions: PgrFunctionSecurityProfileAssignmentSet[]
}

export interface PgrTableScript {
  tableSchema: string,
  tableName: string,
  tableScript: string,
  tableRemoveRlsScript: string
}

export interface PgrSchemaTableScriptSet {
  schemaName: string,
  tableScripts: PgrTableScript[]
}

export interface PgrMasterTableScriptSet {
  schemaTableScriptSets: PgrSchemaTableScriptSet[]
}

export interface PgrFunctionScript {
  functionName: string,
  functionScript: string
}

export interface PgrSchemaFunctionScriptSet {
  schemaName: string,
  functionScripts: PgrFunctionScript[]
}

export interface PgrMasterFunctionScriptSet {
  schemaFunctionScriptSets: PgrSchemaFunctionScriptSet[]
}

export interface PgrScriptSet {
  masterTableScriptSetRemoveRls: PgrMasterTableScriptSet,
  masterTableScriptSet: PgrMasterTableScriptSet,
  masterFunctionScriptSet: PgrMasterFunctionScriptSet,
  ownershipScript: string,
  removeAllRlsScript: string,
  createRolesScript: string
}

export interface PgrDbIntrospection {
  schemaTree: PgrSchema[]
  existingPolicies: any,
  existingPolicyTemplates: any,
  enabledRoles: any
}

export interface PgrScriptTemplateSet {
  functionPolicyTemplate: string,
  ownershipPolicyTemplate: string,
  removeAllRlsScriptTemplate: string,
  schemaUsageSqlTemplate: string,
  tablePolicyTemplate: string,
  rolesTemplate: string,
  dropExistingRlsPoliciesTemplate: string
}