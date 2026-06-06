import type { NavItem } from "@/data/navigation";

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.href === "#") return false;

  if (item.id === "overview") {
    return pathname === "/";
  }

  if (item.id === "rankings") {
    return pathname === "/city" || pathname.startsWith("/city/");
  }

  if (item.href === "/") {
    return pathname === "/";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
