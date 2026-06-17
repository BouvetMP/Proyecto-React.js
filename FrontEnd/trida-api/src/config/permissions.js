export const ROLE_PERMISSIONS = {
  superAdmin: {
    dashboard: true, map: true, transactions: true, alerts: true, users: true,
    analytics: true, settings: true, export: true, manageUsers: true,
    manageRoles: true, assignBanks: true, manageModel: true
  },
  admin: {
    dashboard: true, map: true, transactions: true, alerts: true, users: true,
    analytics: true, settings: true, export: true, manageUsers: true,
    manageRoles: false, assignBanks: false, manageModel: false
  },
  analyst: {
    dashboard: true, map: true, transactions: true, alerts: true, users: false,
    analytics: true, settings: false, export: true, manageUsers: false,
    manageRoles: false, assignBanks: false, manageModel: false
  },
  operator: {
    dashboard: true, map: false, transactions: true, alerts: true, users: false,
    analytics: false, settings: false, export: false, manageUsers: false,
    manageRoles: false, assignBanks: false, manageModel: false
  },
  auditor: {
    dashboard: true, map: false, transactions: true, alerts: true, users: false,
    analytics: true, settings: false, export: true, manageUsers: false,
    manageRoles: false, assignBanks: false, manageModel: false
  }
};

export function getPermissions(role) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.operator;
}
