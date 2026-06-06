import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Database,
  GitCompare,
  LayoutGrid,
  Settings,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const mainNavItems: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid, href: "/" },
  { id: "rankings", label: "City Details", icon: Building2, href: "/#city-details" },
  { id: "compare", label: "Compare Cities", icon: GitCompare, href: "/compare" },
  { id: "data", label: "Data Sources", icon: Database, href: "#" },
];

export const bottomNavItems: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
];
