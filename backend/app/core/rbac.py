from enum import StrEnum


class Role(StrEnum):
    CLINICIAN = "clinician"
    ADMIN = "admin"
    NURSE = "nurse"
    PATIENT = "patient"


# Permission matrix. Start narrow; widen explicitly per role.
# Permissions: chat:{clinical,admin,patient}, ingest:write, users:manage
PERMISSIONS: dict[Role, set[str]] = {
    Role.ADMIN: {"chat:clinical", "chat:admin", "ingest:write", "users:manage"},
    Role.CLINICIAN: {"chat:clinical"},
    Role.NURSE: {"chat:clinical"},
    Role.PATIENT: {"chat:patient"},
}


def has_permission(role: Role, permission: str) -> bool:
    return permission in PERMISSIONS.get(role, set())
