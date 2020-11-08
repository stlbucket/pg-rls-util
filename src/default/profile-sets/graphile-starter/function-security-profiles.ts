import { PgrFunctionSecurityProfileSet } from "../../../d"

const functionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "graphile-starter-no-access",
  "disableSecurityDefinerOwnershipGrants": true,
  "defaultInitialFunctionAssignments": [
    {
      "schemaName": "app_public",
      "functionAssignments": {
        "accept_invitation_to_organization": "graphile-visitor-execute",
        "change_password": "graphile-visitor-execute",
        "confirm_account_deletion": "graphile-visitor-execute",
        "create_organization": "graphile-visitor-execute",
        "current_session_id": "graphile-visitor-execute",
        "current_user": "graphile-visitor-execute",
        "current_user_id": "graphile-visitor-execute",
        "current_user_invited_organization_ids": "graphile-visitor-execute",
        "current_user_member_organization_ids": "graphile-visitor-execute",
        "delete_organization": "graphile-visitor-execute",
        "forgot_password": "graphile-visitor-execute",
        "invite_to_organization": "graphile-visitor-execute",
        "logout": "graphile-visitor-execute",
        "make_email_primary": "graphile-visitor-execute",
        "organization_for_invitation": "graphile-visitor-execute",
        "organizations_current_user_is_billing_contact": "graphile-visitor-execute",
        "organizations_current_user_is_owner": "graphile-visitor-execute",
        "remove_from_organization": "graphile-visitor-execute",
        "request_account_deletion": "graphile-visitor-execute",
        "resend_email_verification_code": "graphile-visitor-execute",
        "reset_password": "graphile-visitor-execute",
        "tg__graphql_subscription": "graphile-visitor-execute",
        "tg_user_emails__forbid_if_verified": "graphile-visitor-execute",
        "tg_user_emails__prevent_delete_last_email": "graphile-visitor-execute",
        "tg_user_emails__verify_account_on_verified": "graphile-visitor-execute",
        "tg_users__deletion_organization_checks_and_actions": "graphile-visitor-execute",
        "transfer_organization_billing_contact": "graphile-visitor-execute",
        "transfer_organization_ownership": "graphile-visitor-execute",
        "users_has_password": "graphile-visitor-execute",
        "verify_email": "graphile-visitor-execute"
      }
    }
  ],
  "functionSecurityProfiles": [
    {
      "name": "graphile-starter-no-access",
      "grants": {
        "EXECUTE": [],
      }
    },
    {
      "name": "graphile-starter-execute",
      "grants": {
        "EXECUTE": ["graphile_starter"],
      }
    },
    {
      "name": "graphile-visitor-execute",
      "grants": {
        "EXECUTE": ["graphile_starter_visitor"],
      }
    }
  ]
}

export default functionSecurityProfileSet
