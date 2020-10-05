import { PgrTableSecurityProfileSet } from "../../../d"

const tableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "graphile-starter:: select,insert,update own",
  "defaultInsertExclusions": [
    "id",
    "created_at"
  ],
  "defaultUpdateExclusions": [
    "id",
    "created_at"
  ],
  "tableSecurityProfiles": [
    {
      "name": "graphile-starter:: no-access",
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
      "name": "graphile-starter:: select,insert,update own",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_visitor"
          }
        ],
        "INSERT": [
          {
            "roleName": "graphile_visitor"
          }
        ],
        "UPDATE": [
        ],
        "DELETE": [
          {
            "roleName": "graphile_visitor"
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "cmd": "SELECT",
            "qual": "user_id \= app_public.current_user_id()",
            "roles": [
              "graphile_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_select",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "cmd": "INSERT",
            "qual": null,
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_insert",
            "with_check": "user_id \= app_public.current_user_id()"
          }
        ],
        "UPDATE": [
          {
            "cmd": "UPDATE",
            "qual": null,
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_update",
            "with_check": "user_id \= app_public.current_user_id()"
          }
        ],
        "DELETE": [
        ]
      }
    }
  ]
}

export default tableSecurityProfileSet