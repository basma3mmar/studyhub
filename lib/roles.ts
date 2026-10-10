export const ROLES = [
  "Super Owner",
  "Owner",
  "Admin",
  "User",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LEVEL: Record<Role, number> = {
  User: 1,
  Admin: 2,
  Owner: 3,
  "Super Owner": 4,
};

export const PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  CREATE_GROUPS: "create_groups",
  MANAGE_GROUPS: "manage_groups",
  VIEW_ADMIN_PANEL: "view_admin_panel",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  User: [],

  Admin: [
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.CREATE_GROUPS,
    PERMISSIONS.MANAGE_GROUPS,
  ],

  Owner: [
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CREATE_GROUPS,
    PERMISSIONS.MANAGE_GROUPS,
  ],

  "Super Owner": [
    PERMISSIONS.VIEW_ADMIN_PANEL,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.CREATE_GROUPS,
    PERMISSIONS.MANAGE_GROUPS,
  ],
};

export function isValidRole(
  value: unknown
): value is Role {
  return (
    typeof value === "string" &&
    ROLES.includes(value as Role)
  );
}

export function hasPermission(
  role: Role,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Original Owner:
 * - أعلى من كل الرتب.
 * - لا يمكن تعديل حسابه.
 * - هو الوحيد الذي يستطيع تعيين Super Owner.
 *
 * Super Owner:
 * - أعلى رتبة عادية.
 * - يستطيع إدارة Owner / Admin / User.
 *
 * Owner:
 * - يستطيع إدارة Admin / User.
 *
 * Admin / User:
 * - لا يستطيعون تغيير الرتب.
 */
export function canManageRole(
  actorRole: Role,
  targetRole: Role,
  isPrimaryOwner = false
): boolean {
  // المالك الأساسي وحده يستطيع تعيين أي رتبة.
  if (actorRole === "Owner" && isPrimaryOwner) {
    return true;
  }

  // تعيين Owner أو Super Owner ممنوع على أي شخص غير المالك الأساسي.
  if (
    targetRole === "Owner" ||
    targetRole === "Super Owner"
  ) {
    return false;
  }

  // Super Owner يستطيع تعيين Admin و User فقط.
  if (actorRole === "Super Owner") {
    return targetRole === "Admin" || targetRole === "User";
  }

  // Owner يستطيع تعيين Admin و User فقط.
  if (actorRole === "Owner") {
    return targetRole === "Admin" || targetRole === "User";
  }

  // Admin و User لا يستطيعان تغيير الرتب.
  return false;
}