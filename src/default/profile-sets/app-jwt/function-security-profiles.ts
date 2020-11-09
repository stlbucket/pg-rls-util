import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "app-visitor-execute",
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
