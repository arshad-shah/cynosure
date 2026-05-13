// packages/react/src/navigation/Sidebar/SidebarHeader.tsx
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { sidebarBody, sidebarFooter, sidebarHeader, sidebarSeparator } from './Sidebar.css.js';

/**
 * Props for the sticky top region of the sidebar — typically holds a brand
 * mark, app switcher, or product nav.
 */
export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
/** Sticky top region of the sidebar. */
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(function SidebarHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarHeader, className)} {...rest} />;
});

/**
 * Props for the scrollable middle region of the sidebar where the
 * navigation lives.
 */
export interface SidebarBodyProps extends HTMLAttributes<HTMLDivElement> {}
/** Scrollable middle region of the sidebar. */
export const SidebarBody = forwardRef<HTMLDivElement, SidebarBodyProps>(function SidebarBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarBody, className)} {...rest} />;
});

/**
 * Props for the sticky bottom region of the sidebar — typically user
 * profile, theme switcher, settings link.
 */
export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
/** Sticky bottom region of the sidebar. */
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(function SidebarFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarFooter, className)} {...rest} />;
});

/**
 * Props for the thin horizontal rule used between Sidebar sections.
 */
export interface SidebarSeparatorProps extends HTMLAttributes<HTMLHRElement> {}
/** Thin horizontal rule between Sidebar sections. */
export const SidebarSeparator = forwardRef<HTMLHRElement, SidebarSeparatorProps>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cn(sidebarSeparator, className)} {...rest} />;
  },
);
