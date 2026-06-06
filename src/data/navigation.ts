import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
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
  { id: "rankings", label: "City Rankings", icon: BarChart3, href: "#" },
  { id: "compare", label: "Compare Cities", icon: GitCompare, href: "/compare" },
  { id: "data", label: "Data Sources", icon: Database, href: "#" },
];

export const bottomNavItems: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
];
