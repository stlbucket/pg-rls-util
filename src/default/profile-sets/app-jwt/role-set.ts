import { PgrRoleSet } from "../../../d"

const roleSet: PgrRoleSet = {
  "name": "app-jwt",
  "dbOwnerRole": {
    "roleName": "app_owner",
    "applicableRoles": []
  },
  "dbAuthenticatorRole": {
    "roleName": "app_authenticator",
    "applicableRoles": [ "app_visitor", "app_anonymous" ]
  },
  "dbUserRoles": [
    {
      "roleName": "app_anonymous",
      "applicableRoles": []
    },
    {
      "roleName": "app_visitor",
      "applicableRoles": ["app_anonymous"]
    }
  ]
}

export default roleSet
