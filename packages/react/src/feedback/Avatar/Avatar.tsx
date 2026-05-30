import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useState,
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
export interface AvatarProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
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
type ImageState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Drive a fallback-vs-image race in a single state machine. The image
 * fires `load`/`error` events; we flip to `loaded`/`error` accordingly,
 * and render the fallback in any non-loaded state.
 */
function useImageLoad(src: string | undefined): ImageState {
  const [state, setState] = useState<ImageState>(src ? 'loading' : 'idle');
  useEffect(() => {
    if (!src) {
      setState('idle');
      return;
    }
    let cancelled = false;
    setState('loading');
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setState('loaded');
    };
    img.onerror = () => {
      if (!cancelled) setState('error');
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  return state;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(props, ref) {
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
  const paletteCls = paletteKey && isPaletteKey(paletteKey) ? avatarPalette[paletteKey] : undefined;

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

  const imageState = useImageLoad(src);
  const showImage = imageState === 'loaded';
  const showFallback = !showImage;

  return (
    <span
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
      {src && showImage ? <img src={src} alt={alt ?? name ?? ''} className={avatarImage} /> : null}
      {showFallback ? (
        <span className={avatarFallback} aria-label={!derivedInitials && name ? name : undefined}>
          {content}
        </span>
      ) : null}
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
    </span>
  );
});

export type { AvatarPaletteKey };
