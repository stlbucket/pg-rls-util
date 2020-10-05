import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "graphile-visitor-execute",
  "functionSecurityProfiles": [
    {
      "name": "graphile-starter-execute",
      "grants": {
        "EXECUTE": ["graphile_starter"],
      }
    },
    {
      "name": "graphile-visitor-execute",
      "grants": {
        "EXECUTE": ["graphile_visitor"],
      }
    }
  ]
}

export default functionSecurityProfileSet