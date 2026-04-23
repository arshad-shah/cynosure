// packages/react/src/navigation/Sidebar/SidebarHeader.tsx
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/cn.js';
import { sidebarBody, sidebarFooter, sidebarHeader, sidebarSeparator } from './Sidebar.css.js';

export interface SidebarHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(function SidebarHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarHeader, className)} {...rest} />;
});

export interface SidebarBodyProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarBody = forwardRef<HTMLDivElement, SidebarBodyProps>(function SidebarBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarBody, className)} {...rest} />;
});

export interface SidebarFooterProps extends HTMLAttributes<HTMLDivElement> {}
export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(function SidebarFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(sidebarFooter, className)} {...rest} />;
});

export interface SidebarSeparatorProps extends HTMLAttributes<HTMLHRElement> {}
export const SidebarSeparator = forwardRef<HTMLHRElement, SidebarSeparatorProps>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cn(sidebarSeparator, className)} {...rest} />;
  },
);
