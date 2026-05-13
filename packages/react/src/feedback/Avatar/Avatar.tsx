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

/**
 * Props for the {@link Avatar} component.
 */
export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<typeof RadixAvatar.Root>, 'children'> {
  /** Image source URL. When omitted or failed to load, the fallback renders. */
  src?: string;
  /** User's display name, used to derive initials and a deterministic colour. */
  name?: string;
  /** `alt` text for the image; falls back to `name`. */
  alt?: string;
  /** Custom fallback node rendered when the image is unavailable. */
  fallback?: ReactNode;
  /** Icon shown when neither image nor initials are available. */
  icon?: ReactNode;
  /**
   * Pixel scale. One of `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.
   * @default "md"
   */
  size?: AvatarSize;
  /**
   * Outline shape. One of `circle`, `square`, `rounded`.
   * @default "circle"
   */
  shape?: AvatarShape;
  /**
   * Palette token for the fallback background. When omitted, a colour is
   * derived deterministically from `name`.
   */
  colorScheme?: AvatarPaletteKey;
  /** Presence indicator. One of `online`, `offline`, `away`, `busy`. */
  status?: AvatarStatus;
  /**
   * Where the presence dot sits relative to the avatar.
   * @default "bottom-right"
   */
  statusPosition?: AvatarStatusPosition;
  /**
   * Render a halo ring around the avatar; useful for stacking in groups.
   * @default false
   */
  ring?: boolean;
  /** Overrides the initials derived from `name`. */
  initials?: string;
}

const isPaletteKey = (value: string | undefined): value is AvatarPaletteKey =>
  typeof value === 'string' && (AVATAR_PALETTE as readonly string[]).includes(value);

/**
 * Compact visual representation of a user, organisation, or entity. Avatar
 * resolves a graceful fallback chain: image, then initials derived from
 * `name`, then a provided icon. It can display a presence dot for status and
 * inherits size/ring defaults from a surrounding `AvatarGroup`.
 */
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
