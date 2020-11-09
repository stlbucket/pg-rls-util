import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "app-visitor-execute",
  "defaultInitialFunctionAssignments": [
    {
      "schemaName": "auth_fn",
      "functionAssignments": {
        "authenticate": "app-anonymous-execute"
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
      "name": "app-visitor-execute",
      "grants": {
        "EXECUTE": ["app_visitor"],
      }
    },
    {
      "name": "app-anonymous-execute",
      "grants": {
        "EXECUTE": ["app_anonymous"],
      }
    }
  ]
}

export default functionSecurityProfileSet
