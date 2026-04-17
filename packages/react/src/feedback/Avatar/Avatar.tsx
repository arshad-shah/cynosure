import * as RadixAvatar from '@radix-ui/react-avatar';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  forwardRef,
  useContext,
} from 'react';
import { cn } from '../../utils/cn.js';
import { AvatarGroupContext } from '../AvatarGroup/context.js';
import {
  avatarFallback,
  avatarImage,
  avatarPalette,
  avatarRing,
  avatarRoot,
  avatarShape,
  avatarSize,
  avatarStatus,
  avatarStatusColor,
  avatarStatusPosition,
} from './Avatar.css.js';
import {
  AVATAR_PALETTE,
  type AvatarPaletteKey,
  colorFromName,
  initialsFromName,
} from './colorFromName.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';
export type AvatarStatusPosition = 'top-right' | 'bottom-right';

export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixAvatar.Root>, 'children'> {
  src?: string;
  name?: string;
  alt?: string;
  fallback?: ReactNode;
  icon?: ReactNode;
  size?: AvatarSize;
  shape?: AvatarShape;
  colorScheme?: AvatarPaletteKey;
  status?: AvatarStatus;
  statusPosition?: AvatarStatusPosition;
  ring?: boolean;
  /** Overrides the initials derived from `name`. */
  initials?: string;
}

const isPaletteKey = (value: string | undefined): value is AvatarPaletteKey =>
  typeof value === 'string' && (AVATAR_PALETTE as readonly string[]).includes(value);

export const Avatar = forwardRef<ElementRef<typeof RadixAvatar.Root>, AvatarProps>(
  function Avatar(props, ref) {
    const group = useContext(AvatarGroupContext);
    const {
      src,
      name,
      alt,
      fallback,
      icon,
      size = group?.size ?? 'md',
      shape = 'circle',
      colorScheme,
      status,
      statusPosition = 'bottom-right',
      ring = group?.ring ?? false,
      initials,
      className,
      ...rest
    } = props;

    const derivedInitials = initials ?? (name ? initialsFromName(name) : '');
    const paletteKey = colorScheme ?? (name ? colorFromName(name) : undefined);
    const paletteCls =
      paletteKey && isPaletteKey(paletteKey) ? avatarPalette[paletteKey] : undefined;

    let content: ReactNode;
    if (fallback !== undefined) {
      content = fallback;
    } else if (derivedInitials) {
      content = derivedInitials;
    } else if (icon) {
      content = icon;
    } else {
      content = null;
    }

    return (
      <RadixAvatar.Root
        ref={ref}
        className={cn(
          avatarRoot,
          avatarSize[size],
          avatarShape[shape],
          paletteCls,
          ring ? avatarRing : undefined,
          className,
        )}
        {...rest}
      >
        {src ? (
          <RadixAvatar.Image src={src} alt={alt ?? name ?? ''} className={avatarImage} />
        ) : null}
        <RadixAvatar.Fallback
          delayMs={src ? 400 : undefined}
          className={avatarFallback}
          aria-label={!derivedInitials && name ? name : undefined}
        >
          {content}
        </RadixAvatar.Fallback>
        {status ? (
          <span
            aria-hidden="true"
            data-status={status}
            className={cn(
              avatarStatus,
              avatarStatusPosition[statusPosition],
              avatarStatusColor[status],
            )}
          />
        ) : null}
      </RadixAvatar.Root>
    );
  },
);

export type { AvatarPaletteKey };
