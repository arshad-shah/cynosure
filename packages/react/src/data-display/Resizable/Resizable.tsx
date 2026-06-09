import { type ReactNode, forwardRef } from 'react';
import {
  Group as RRPGroup,
  type GroupProps as RRPGroupProps,
  Panel as RRPPanel,
  type PanelProps as RRPPanelProps,
  Separator as RRPSeparator,
  type SeparatorProps as RRPSeparatorProps,
} from 'react-resizable-panels';
import { cn } from '../../utils/cn.js';
import {
  resizableHandle,
  resizableHandleDot,
  resizableHandleGrip,
  resizablePanel,
  resizableRoot,
} from './Resizable.css.js';

export type ResizableDirection = 'horizontal' | 'vertical';

/** Props for the {@link Resizable} panel group. Inherits the rest of `react-resizable-panels`' `Group` API. */
export interface ResizableProps extends Omit<RRPGroupProps, 'orientation'> {
  /**
   * Layout axis. `horizontal` arranges panels side-by-side; `vertical` stacks
   * them top-to-bottom.
   * @default "horizontal"
   */
  direction?: ResizableDirection;
}

/**
 * Resizable is a split layout with drag-to-resize handles. Wraps
 * `react-resizable-panels` Group and exposes `direction` as the friendlier
 * cynosure prop name (mapped to the underlying `orientation`). Drop
 * {@link ResizablePanel} children separated by {@link ResizableHandle} to
 * build N-pane layouts. Handles are keyboard-resizable via arrow keys.
 */
export const Resizable = forwardRef<HTMLDivElement, ResizableProps>(function Resizable(
  { direction = 'horizontal', className, ...rest },
  _ref,
) {
  return (
    <RRPGroup
      orientation={direction}
      data-orientation={direction}
      className={cn(resizableRoot, className)}
      {...rest}
    />
  );
});

/** Props for a single {@link ResizablePanel}. Inherits sizing props (`defaultSize`, `minSize`, `maxSize`) from `react-resizable-panels`. */
export interface ResizablePanelProps extends RRPPanelProps {}

/** One panel inside a {@link Resizable} group. Must be a direct child paired with {@link ResizableHandle}s between siblings. */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel({ className, ...rest }, _ref) {
    return <RRPPanel className={cn(resizablePanel, className)} {...rest} />;
  },
);

/** Props for the {@link ResizableHandle} draggable divider between panels. */
export interface ResizableHandleProps extends RRPSeparatorProps {
  /**
   * Render a three-dot grip affordance in the middle of the handle. The grip
   * is always present (so users can spot it without hovering) and lifts to
   * the accent colour on hover, keyboard focus, and during active drag.
   * @default false
   */
  withHandle?: boolean;
}

/**
 * Drag handle between two {@link ResizablePanel} siblings. Renders a focusable
 * separator with an 8px hit target, a 1px accent line centered on the edge
 * (which thickens and turns accent on hover, focus, and active drag) and an
 * optional three-dot grip.
 */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle({ withHandle, className, children, ...rest }, _ref) {
    const content: ReactNode = children ?? (withHandle ? <ThreeDotGrip /> : null);
    return (
      <RRPSeparator className={cn(resizableHandle, className)} {...rest}>
        {content}
      </RRPSeparator>
    );
  },
);

function ThreeDotGrip(): React.ReactElement {
  return (
    <span className={resizableHandleGrip} aria-hidden>
      <span className={resizableHandleDot} />
      <span className={resizableHandleDot} />
      <span className={resizableHandleDot} />
    </span>
  );
}

/** Semantic alias of Resizable for design systems that prefer the name. */
export const Splitter = Resizable;
export const SplitterPanel = ResizablePanel;
export const SplitterHandle = ResizableHandle;
