import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "app-usr-execute",
  "defaultInitialFunctionAssignments": [
    {
      "schemaName": "auth_fn",
      "functionAssignments": {
        "authenticate": "app-anon-execute"
      }
    }
  ],
  "functionSecurityProfiles": [
    {
      "name": "no-external-execute",
      "grants": {
        "EXECUTE": [],
      }
    },
    {
      "name": "app-adm-execute",
      "grants": {
        "EXECUTE": ["app_adm"],
      }
    },
    {
      "name": "app-sp-adm-execute",
      "grants": {
        "EXECUTE": ["app_sp_adm"],
      }
    },
    {
      "name": "app-usr-execute",
      "grants": {
        "EXECUTE": ["app_usr"],
      }
    },
    {
      "name": "app-anon-execute",
      "grants": {
        "EXECUTE": ["app_anon"],
      }
    }
  ]
}

export default functionSecurityProfileSet
