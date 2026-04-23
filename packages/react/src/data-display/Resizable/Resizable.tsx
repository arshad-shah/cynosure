import { GripVerticalIcon } from 'lucide-react';
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
  resizableHandleGrip,
  resizablePanel,
  resizableRoot,
} from './Resizable.css.js';

export type ResizableDirection = 'horizontal' | 'vertical';

export interface ResizableProps extends Omit<RRPGroupProps, 'orientation'> {
  direction?: ResizableDirection;
}

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

export interface ResizablePanelProps extends RRPPanelProps {}

export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel({ className, ...rest }, _ref) {
    return <RRPPanel className={cn(resizablePanel, className)} {...rest} />;
  },
);

export interface ResizableHandleProps extends RRPSeparatorProps {
  /** Render a small drag-indicator grip in the middle. Default `false`. */
  withHandle?: boolean;
}

export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle({ withHandle, className, children, ...rest }, _ref) {
    const content: ReactNode = children ?? (withHandle ? <GripVerticalIcon size={'14'} /> : null);
    return (
      <RRPSeparator className={cn(resizableHandle, className)} {...rest}>
        {content !== null ? <span className={resizableHandleGrip}>{content}</span> : null}
      </RRPSeparator>
    );
  },
);

/** Semantic alias of Resizable for design systems that prefer the name. */
export const Splitter = Resizable;
export const SplitterPanel = ResizablePanel;
export const SplitterHandle = ResizableHandle;
