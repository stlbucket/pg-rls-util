import { PgrTableSecurityProfileSet } from "../../../d"

const tableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "all-access",
  "includeTableRlsRemoval": true,
  "defaultInsertExclusions": [
    "id",
    "created_at"
  ],
  "defaultUpdateExclusions": [
    "id",
    "created_at"
  ],
  "defaultInitialTableAssignments": [],
  "tableSecurityProfiles": [
    {
      "name": "no-access",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [],
        "SELECT": [],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    },
    {
      "name": "all-access",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_visitor"
          }
        ],
        "SELECT": [],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [
          {
            "using": "true",
            "roles": [
              "app_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_access",
            "with_check": null
          }
        ],
        "SELECT": [],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    }
  ]
}

export default tableSecurityProfileSet
