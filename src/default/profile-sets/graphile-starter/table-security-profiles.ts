import { PgrTableSecurityProfileSet } from "../../../d"

const tableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "no-access",
  "includeTableRlsRemoval": false,
  "defaultInsertExclusions": [
    "id",
    "created_at",
    "updated_at"
  ],
  "defaultUpdateExclusions": [
    "id",
    "created_at",
    "updated_at"
  ],
  "defaultInitialTableAssignments": [
    {
      "schemaName": "app_public",
      "tableAssignments": {
        "organizations": "app_public.organizations",
        "organization_memberships": "app_public.organization_memberships",
        "user_emails": {
          "tableSecurityProfileName": "select-insert-update own",
          "insertAllowances": ["email"],
          "updateAllowances": ["email"]
        },
        "user_authentications": "select-delete-own",
        "users": {
          "tableSecurityProfileName": "app_public.users",
          "insertAllowances": [],
          "updateAllowances": ["username", "name", "avatar_url"]
        }
      },
      "viewAssignments": {}
    }
  ],
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
      "name": "select-insert-update own",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "INSERT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "UPDATE": [
        ],
        "DELETE": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "qual": "user_id = app_public.current_user_id()",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_own",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "qual": null,
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "insert_own",
            "with_check": "user_id = app_public.current_user_id()"
          }
        ],
        "UPDATE": [
          {
            "qual": "user_id = app_public.current_user_id()",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "update_own",
            "with_check": "user_id = app_public.current_user_id()"
          }
        ],
        "DELETE": [
        ]
      }
    },
    {
      "name": "app_public.users",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
          {
            "roleName": "graphile_starter_visitor",
          }
        ],
        "DELETE": [
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "qual": "true",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_all",
            "with_check": null
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
          {
            "qual": "id = app_public.current_user_id()",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "update_self",
            "with_check": "id = app_public.current_user_id()"
          }
        ],
        "DELETE": [
        ]
      }
    },
    {
      "name": "app_public.organizations",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
          {
            "roleName": "graphile_starter_visitor",
            "exclusions": ["id", "created_at"]
          }
        ],
        "DELETE": [
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "qual": "id IN ( SELECT app_public.current_user_member_organization_ids() AS current_user_member_organization_ids)",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_member",
            "with_check": null
          },
          {
            "qual": "id IN ( SELECT app_public.current_user_invited_organization_ids() AS current_user_invited_organization_ids)",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_invited",
            "with_check": null
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
          {
            "qual": null,
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "update_owner",
            "with_check": "(EXISTS ( SELECT 1 FROM app_public.organization_memberships WHERE ((organization_memberships.organization_id = organizations.id) AND (organization_memberships.user_id = app_public.current_user_id()) AND (organization_memberships.is_owner IS TRUE))))"
          }
        ],
        "DELETE": [
        ]
      }
    },
    {
      "name": "app_public.organization_memberships",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
        ],
        "DELETE": [
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "qual": "id IN ( SELECT app_public.current_user_member_organization_ids() AS current_user_member_organization_ids)",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_member",
            "with_check": null
          },
          {
            "qual": "id IN ( SELECT app_public.current_user_invited_organization_ids() AS current_user_invited_organization_ids)",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_invited",
            "with_check": null
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
        ],
        "DELETE": [
        ]
      }
    },
    {
      "name": "select-delete-own",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
        ],
        "DELETE": [
          {
            "roleName": "graphile_starter_visitor"
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "qual": "user_id = app_public.current_user_id()",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "select_own",
            "with_check": null
          }
        ],
        "INSERT": [
        ],
        "UPDATE": [
        ],
        "DELETE": [
          {
            "qual": "user_id = app_public.current_user_id()",
            "roles": [
              "graphile_starter_visitor"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "delete_own",
            "with_check": null
          }
        ]
      }
    }
  ]
}

export default tableSecurityProfileSet
