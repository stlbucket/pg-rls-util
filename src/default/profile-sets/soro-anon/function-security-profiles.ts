import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "super-admin-execute",
  "defaultInitialFunctionAssignments": [],
  "functionSecurityProfiles": [
    {
      "name": "super-admin-execute",
      "grants": {
        "EXECUTE": ["soro_super_admin"],
      }
    },
    {
      "name": "user-execute",
      "grants": {
        "EXECUTE": ["soro-user"],
      }
    }
  ]
}

export default functionSecurityProfileSet