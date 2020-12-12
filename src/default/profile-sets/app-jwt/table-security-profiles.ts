import { PgrTableSecurityProfileSet } from "../../../d"

const tableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "all-select",
  "includeTableRlsRemoval": true,
  "defaultInsertExclusions": [
    "id",
    "created_at"
  ],
  "defaultUpdateExclusions": [
    "id",
    "created_at"
  ],
  "defaultInitialTableAssignments": [
    {
      "schemaName": "app",
      "tableAssignments": {
        "app_user": "app-user-access-direct",
        "app_tenant": "app-tenant-access-direct",
        "license": "app-license-assigned-to",
        "license_permission": "app-license-permission-assigned-to",
        "app_tenant_subscription": "app-tenant-select"
      },
      "viewAssignments": {}
    },
    {
      "schemaName": "org",
      "tableAssignments": {
        "organization": "app-tenant-select",
        "contact": "app-tenant-select",
        "facility": "app-tenant-select",
        "location": "app-tenant-select"
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
      "name": "all-access",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_usr"
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
              "app_usr"
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
    },
    {
      "name": "all-select",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "app_usr"
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [
          {
            "using": "true",
            "roles": [
              "app_sp_adm"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_access",
            "with_check": null
          }
        ],
        "SELECT": [
          {
            "using": "true",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_select",
            "with_check": null
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    },
    {
      "name": "app-tenant-access-direct",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_usr"
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
            "using": "(auth_fn.app_user_has_access(id))",
            "roles": [
              "app_usr"
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
    },
    {
      "name": "app-tenant-access",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_usr"
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
            "using": "(auth_fn.app_user_has_access(app_tenant_id))",
            "roles": [
              "app_usr"
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
    },
    {
      "name": "app-tenant-select",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_sp_adm"
          }
        ],
        "SELECT": [
          {
            "roleName": "app_usr"
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [
          {
            "using": "true",
            "roles": [
              "app_sp_adm"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_access",
            "with_check": null
          }
        ],
        "SELECT": [
          {
            "using": "(auth_fn.app_user_has_access(app_tenant_id))",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "app_tenant_select",
            "with_check": null
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    },
    {
      "name": "app-user-access-direct",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_usr"
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
            "using": "(id = auth_fn.current_app_user_id())",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "user_access",
            "with_check": null
          },
          {
            "using": "(auth_fn.app_user_has_access(app_tenant_id))",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "tenant_access",
            "with_check": null
          }
        ],
        "SELECT": [],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    },
    {
      "name": "app-license-assigned-to",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_sp_adm"
          }
        ],
        "SELECT": [
          {
            "roleName": "app_usr"
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [
          {
            "using": "true",
            "roles": [
              "app_sp_adm"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_access",
            "with_check": null
          }
        ],
        "SELECT": [
          {
            "using": "(assigned_to_app_user_id = auth_fn.current_app_user_id())",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "assigned_to",
            "with_check": null
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    },
    {
      "name": "app-license-permission-assigned-to",
      "enableRls": true,
      "grants": {
        "ALL": [
          {
            "roleName": "app_sp_adm"
          }
        ],
        "SELECT": [
          {
            "roleName": "app_usr"
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      },
      "policies": {
        "ALL": [
          {
            "using": "true",
            "roles": [
              "app_sp_adm"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "all_access",
            "with_check": null
          }
        ],
        "SELECT": [
          {
            "using": "(license_id in (select id from app.license where assigned_to_app_user_id = auth_fn.current_app_user_id()))",
            "roles": [
              "app_usr"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "license_assigned_to",
            "with_check": null
          }
        ],
        "INSERT": [],
        "UPDATE": [],
        "DELETE": []
      }
    }
  ]
}

export default tableSecurityProfileSet
