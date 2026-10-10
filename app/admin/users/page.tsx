import { requirePermission } from "@/lib/auth";
import UsersManagement from "./UsersManagement";

export default async function AdminUsersPage() {
  await requirePermission("manage_users");

  return <UsersManagement />;
}