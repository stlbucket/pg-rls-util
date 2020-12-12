import { PgrRoleSet } from "../../../d"

const roleSet: PgrRoleSet = {
  "name": "app-jwt",
  "dbOwnerRole": {
    "roleName": "app_owner",
    "applicableRoles": []
  },
  "dbAuthenticatorRole": {
    "roleName": "app_authenticator",
    "applicableRoles": [ "app_anon", "app_usr", "app_adm", "app_sp_adm" ]
  },
  "dbUserRoles": [
    {
      "roleName": "app_anon",
      "applicableRoles": []
    },
    {
      "roleName": "app_usr",
      "applicableRoles": ["app_anon"]
    },
    {
      "roleName": "app_adm",
      "applicableRoles": ["app_anon", "app_usr"]
    },
    {
      "roleName": "app_sp_adm",
      "applicableRoles": ["app_anon", "app_usr", "app_adm"]
    }
  ]
}

export default roleSet
