import { createContext, useContext } from "react";

/** The rail state AppShell hands the navigation in its column: whether it is collapsed, and a way to change it. */
export interface NavRail {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const NavRailContext = createContext<NavRail | null>(null);

/**
 * The rail state of the AppShell column a SideNav sits in (`null` anywhere else: a drawer, a tab bar, a page).
 * SideNav follows it when its own `collapsed` is not given.
 */
export const useNavRail = () => useContext(NavRailContext);
