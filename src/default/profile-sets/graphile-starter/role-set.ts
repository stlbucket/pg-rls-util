import { PgrRoleSet } from "../../../d"

const roleSet: PgrRoleSet = {
  "name": "graphile-starter",
  "dbOwnerRole": {
    "roleName": "graphile_starter",
    "applicableRoles": []
  },
  "dbAuthenticatorRole": {
    "roleName": "graphile_starter_authenticator",
    "applicableRoles": [ "graphile_starter_visitor" ]
  },
  "dbUserRoles": [
    {
      "roleName": "graphile_starter_visitor",
      "applicableRoles": []
    }
  ]
}

export default roleSet