import {
  Children,
  type CSSProperties,
  createContext,
  forwardRef,
  type ReactElement,
  type ReactNode,
  useContext,
  useRef,
} from "react";
import { Icon } from "../../foundations/Icon/Icon.js";
import { useImageOutcome } from "../../foundations/image-outcome.js";
import type { IconData } from "../../icons/types.js";
import { user } from "../../icons/user.js";
import type { Tone } from "../../tokens/schema.js";

export interface AvatarTokens {
  /** Width and height at `size="xs"`. */
  sizeXs: string;
  /** Width and height at `size="sm"` (the small control height). */
  sizeSm: string;
  /** Width and height at `size="md"` (the medium control height). */
  sizeMd: string;
  /** Width and height at `size="lg"` (the large control height). */
  sizeLg: string;
  /** Width and height at `size="xl"`. */
  sizeXl: string;
  /** Corner radius of the square shape. */
  radius: string;
  /** Weight of the initials. */
  fontWeight: string;
  /** Tint strength of the fallback (percentage of the tone mixed into the surface). */
  softMix: string;
  /** Diameter of the status dot. */
  statusSize: string;
  /** Colour of the ring around grouped avatars and the status dot (the surface they sit on). */
  ringColor: string;
  /** Width of that ring. */
  ringWidth: string;
  /** How far each avatar in an AvatarGroup slides over the one before it. */
  overlap: string;
}

declare module "../../tokens/schema.js" {
  interface ComponentTokens {
    avatar: AvatarTokens;
  }
}

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

/** The spoken names of the statuses. */
export type AvatarLabels = Record<AvatarStatus, string>;

const STATUS_LABELS: AvatarLabels = { online: "online", away: "away", busy: "busy", offline: "offline" };
const AUTO_TONES: readonly Tone[] = ["accent", "info", "success", "warning", "danger"];
/** Punctuation before a word's first letter, number or emoji ("(Guest)", "@ada"). */
const LEADING = /^[^\p{L}\p{N}\p{Extended_Pictographic}\p{Regional_Indicator}]+/u;

/** The first character as a person sees it: a whole emoji or accented letter where the engine can segment text. */
function firstCharacter(word: string): string {
  const first = Intl.Segmenter
    ? new Intl.Segmenter().segment(word)[Symbol.iterator]().next().value?.segment
    : Array.from(word)[0];
  return (first as string).toUpperCase();
}

/** First letters of the first and last word, upper-cased. One word gives one letter. */
function initialsOf(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(LEADING, ""))
    .filter(Boolean);
  return (words.length > 1 ? [words[0] as string, words.at(-1) as string] : words)
    .map(firstCharacter)
    .join("");
}

/** The same tone for the same name, on every render and on the server. */
function toneOf(name: string): Tone {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AUTO_TONES[hash % AUTO_TONES.length] as Tone;
}

/** The size an AvatarGroup gives its avatars. */
const GroupSize = createContext<AvatarSize | undefined>(undefined);

export interface AvatarProps {
  /** Who or what it is: the accessible name, and where the initials come from. An empty name is not announced. */
  name: string;
  /** Replaces the initials worked out from `name` (one or two characters). */
  initials?: string | undefined;
  /** The picture. The fallback shows while it loads, and stays when it is missing or fails to load. */
  src?: string | undefined;
  /**
   * The fallback for things that are not people: shown instead of initials worked out from `name`. Without it, a
   * name with no letters falls back to the `user` icon.
   */
  icon?: IconData | undefined;
  /** Width and height. Inside an AvatarGroup the group's `size` is used. Default "md". */
  size?: AvatarSize;
  /** Outline: a circle, or a square with rounded corners. Default "circle". */
  shape?: "circle" | "square";
  /**
   * Colour of the fallback. `"auto"` picks a tone from `name`, the same one every time, so people in a list are
   * easier to tell apart (decoration: the name still has to be shown or spoken). Default "neutral".
   */
  tone?: Tone | "auto";
  /** Any CSS colour for the fallback, for a one-off. Overrides `tone`. */
  color?: string | undefined;
  /** A dot at the corner, spoken after the name ("Ada Lovelace, online"). */
  status?: AvatarStatus | undefined;
  /** The spoken names of the statuses, to translate them. */
  labels?: Partial<AvatarLabels>;
  /** Hides the avatar from assistive technology, for when the name is written beside it. */
  decorative?: boolean;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-avatar-*` tokens. */
  style?: CSSProperties;
}

/** A person, team or thing as a picture, falling back to initials and then to an icon. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  {
    name,
    initials,
    src,
    icon,
    size = "md",
    shape = "circle",
    tone = "neutral",
    color,
    status,
    labels,
    decorative = false,
    className,
    style,
  },
  ref,
) {
  const groupSize = useContext(GroupSize);
  const image = useRef<HTMLImageElement>(null);
  // A new `src` starts again from the fallback; the picture shows once it has loaded and goes if it fails.
  const picture = useImageOutcome(image, src ?? "");
  const outcome = picture.outcome === "loading" ? undefined : picture.outcome === "loaded";
  const letters = initials ?? (icon ? "" : initialsOf(name));
  return (
    <span
      ref={ref}
      className={`cy-avatar${className ? ` ${className}` : ""}`}
      {...(decorative || !name.trim()
        ? { "aria-hidden": true }
        : {
            role: "img",
            "aria-label": status ? `${name}, ${labels?.[status] ?? STATUS_LABELS[status]}` : name,
          })}
      data-size={groupSize ?? size}
      data-shape={shape}
      data-tone={color ? undefined : tone === "auto" ? toneOf(name) : tone}
      data-color={color ? "" : undefined}
      style={color ? ({ "--_tone": color, ...style } as CSSProperties) : style}
    >
      {outcome !== true &&
        (letters ? (
          <span className="cy-reset cy-avatar-initials">{letters}</span>
        ) : (
          <Icon icon={icon ?? user} />
        ))}
      {src && outcome !== false && (
        <img
          // A new element for each picture, so `complete` never describes the one before.
          key={src}
          ref={image}
          className="cy-reset cy-avatar-image"
          src={src}
          alt=""
          data-loaded={outcome ? "" : undefined}
          onLoad={picture.loaded}
          onError={picture.failed}
        />
      )}
      {status && <span className="cy-reset cy-avatar-status" data-status={status} />}
    </span>
  );
});

export interface AvatarGroupLabels {
  /** Accessible name of the "+3" avatar, from how many are hidden and their names. */
  more: (count: number, names: string[]) => string;
}

export interface AvatarGroupProps {
  /** The Avatars, in order. */
  children: ReactNode;
  /** Names the group for assistive technology ("Reviewers"). */
  label: string;
  /** Show this many avatars, then one "+3" avatar that stands for the rest. */
  max?: number | undefined;
  /** Size of every avatar in the group. Default "md". */
  size?: AvatarSize;
  /** The built-in string, to translate it. */
  labels?: Partial<AvatarGroupLabels>;
  /** Added to the root element, for layout. */
  className?: string;
  /** Layout only. Restyle through `--cy-avatar-*` tokens. */
  style?: CSSProperties;
}

/** Several avatars overlapping along the reading direction, the rest summarised as "+3". */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { children, label, max, size = "md", labels, className, style },
  ref,
) {
  const all = Children.toArray(children);
  const shown = max !== undefined && all.length > max ? Math.max(max, 0) : all.length;
  const hidden = all.slice(shown);
  const names = hidden
    .map((child) => (child as ReactElement<Partial<AvatarProps>>).props?.name)
    .filter((name) => name !== undefined);
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of pictures, not a form's fieldset
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={`cy-avatar-group${className ? ` ${className}` : ""}`}
      style={style}
    >
      <GroupSize.Provider value={size}>
        {all.slice(0, shown)}
        {hidden.length > 0 && (
          <Avatar
            name={(labels?.more ?? ((count, list) => `${count} more: ${list.join(", ")}`))(
              hidden.length,
              names,
            )}
            initials={`+${hidden.length}`}
          />
        )}
      </GroupSize.Provider>
    </div>
  );
});
