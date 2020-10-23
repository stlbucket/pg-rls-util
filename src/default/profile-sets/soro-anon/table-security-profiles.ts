import { PgrTableSecurityProfileSet } from "../../../d"

const tableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "no-access",
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
      "name": "all-actions::all-users",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "soro_user"
          }
        ],
        "INSERT": [
          {
            "roleName": "soro_user",
          },
          {
            "roleName": "soro_super_admin",
            "exclusions": ["created_at"]
          }
        ],
        "UPDATE": [
          {
            "roleName": "soro_user",
          },
          {
            "roleName": "soro_super_admin"
          }
        ],
        "DELETE": [
          {
            "roleName": "soro_user"
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "cmd": "SELECT",
            "using": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_select",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "cmd": "INSERT",
            "using": null,
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_insert",
            "with_check": "soro.check_access(seller_id)"
          }
        ],
        "UPDATE": [
          {
            "cmd": "UPDATE",
            "using": null,
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_update",
            "with_check": "soro.check_access(seller_id)"
          }
        ],
        "DELETE": [
          {
            "cmd": "DELETE",
            "using": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_delete",
            "with_check": null
          }
        ]
      }
    },
    {
      "name": "super-admin-crud::user-read",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "soro_user"
          }
        ],
        "INSERT": [
          {
            "roleName": "soro_super_admin",
          }
        ],
        "UPDATE": [
          {
            "roleName": "soro_super_admin",
          }
        ],
        "DELETE": [
          {
            "roleName": "soro_super_admin",
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "cmd": "SELECT",
            "using": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_select",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "cmd": "INSERT",
            "using": null,
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_insert",
            "with_check": "true"
          }
        ],
        "UPDATE": [
          {
            "cmd": "UPDATE",
            "using": null,
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_update",
            "with_check": "true"
          }
        ],
        "DELETE": [
          {
            "cmd": "DELETE",
            "using": "true",
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_delete",
            "with_check": null
          }
        ]
      }
    }
  ]
}

export default tableSecurityProfileSet
