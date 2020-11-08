import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "app-visitor-execute",
  "disableSecurityDefinerOwnershipGrants": false,
  "defaultInitialFunctionAssignments": [],
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
    }
  ]
}

export default functionSecurityProfileSet
