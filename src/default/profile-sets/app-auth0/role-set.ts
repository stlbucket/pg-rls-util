import { PgrRoleSet } from "../../../d"

const roleSet: PgrRoleSet = {
  "name": "soro-anon",
  "dbOwnerRole": {
    "roleName": "soro",
    "applicableRoles": []
  },
  "dbAuthenticatorRole": {
    "roleName": "postgres",
    "applicableRoles": [ "soro_admin", "soro_user","soro_anonymous" ]
  },
  "dbUserRoles": [
    {
      "roleName": "soro_super_admin",
      "applicableRoles": []
    },
    {
      "roleName": "soro_admin",
      "applicableRoles": []
    },
    {
      "roleName": "soro_user",
      "applicableRoles": []
    },
    {
      "roleName": "soro_anonymous",
      "applicableRoles": []
    }
  ]
}

export default roleSet