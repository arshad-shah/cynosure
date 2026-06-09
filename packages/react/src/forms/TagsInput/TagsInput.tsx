import { X } from 'lucide-react';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMergedRef } from '../../hooks/useMergedRef.js';
import { cn } from '../../utils/cn.js';
import { tag as tagClass, tagRemove } from '../MultiSelect/MultiSelect.css.js';
import { controlSize, controlWrapperBase, controlWrapperVariant } from '../shared/control.css.js';
import type { FormControlSize, FormControlVariant } from '../shared/types.js';
import { inlineInput, tagsRow } from './TagsInput.css.js';

/** Props for `<TagsInput>` — free-form tag entry. */
export interface TagsInputProps {
  /** Controlled list of tags. */
  value?: readonly string[];
  /** Uncontrolled initial list of tags. */
  defaultValue?: readonly string[];
  /** Fires with the next array on every commit / remove. */
  onValueChange?: (tags: string[]) => void;
  /**
   * Keys that commit the current draft token.
   * @default ["Enter", ","]
   */
  commitKeys?: readonly string[];
  /**
   * Placeholder rendered when no tags are present.
   * @default "Add tag…"
   */
  placeholder?: string;
  /**
   * Control size.
   * @default "md"
   */
  size?: FormControlSize;
  /**
   * Visual treatment.
   * @default "outline"
   */
  variant?: FormControlVariant;
  /** Disables interaction. */
  disabled?: boolean;
  /** Renders tags but blocks editing. */
  readOnly?: boolean;
  /** Renders the invalid state. */
  invalid?: boolean;
  /** Optional suggestions rendered as a `<datalist>` for the inline input. */
  suggestions?: readonly string[];
  /**
   * Disallow duplicate tags (case-sensitive).
   * @default true
   */
  unique?: boolean;
  /** Hard cap on tag count. */
  maxTags?: number;
  /** Custom renderer for each tag. Receives the tag string, its index, and a `remove` callback. */
  renderTag?: (tag: string, index: number, remove: () => void) => ReactNode;
  /** Accessible label for the inline input. */
  label?: string;
  'aria-label'?: string;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

/** Free-form tag entry. Enter / comma commits; Backspace on empty removes last. */
export const TagsInput = forwardRef<HTMLInputElement, TagsInputProps>(
  function TagsInput(props, ref) {
    const {
      value: valueProp,
      defaultValue,
      onValueChange,
      commitKeys = ['Enter', ','],
      placeholder = 'Add tag…',
      size = 'md',
      variant = 'outline',
      disabled,
      readOnly,
      invalid,
      suggestions,
      unique = true,
      maxTags,
      renderTag,
      label,
      id: idProp,
      name,
      className,
      style,
    } = props;

    const fallbackId = useId();
    const id = idProp ?? fallbackId;

    const [tags, setTags] = useControllableState<string[]>({
      value: valueProp as string[] | undefined,
      defaultValue: (defaultValue as string[] | undefined) ?? [],
      onChange: onValueChange,
    });

    const [draft, setDraft] = useState('');
    const [focused, setFocused] = useState(false);
    const inputNodeRef = useRef<HTMLInputElement | null>(null);
    const mergedRef = useMergedRef(ref, inputNodeRef);

    const commit = useCallback(
      (raw: string) => {
        const trimmed = raw.trim();
        if (trimmed === '') return;
        if (maxTags !== undefined && tags.length >= maxTags) return;
        if (unique && tags.includes(trimmed)) {
          setDraft('');
          return;
        }
        setTags([...tags, trimmed]);
        setDraft('');
      },
      [maxTags, setTags, tags, unique],
    );

    const removeAt = useCallback(
      (index: number) => {
        const next = tags.slice();
        next.splice(index, 1);
        setTags(next);
      },
      [setTags, tags],
    );

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (commitKeys.includes(event.key)) {
        if (draft !== '') {
          event.preventDefault();
          commit(draft);
        }
        return;
      }
      if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
        event.preventDefault();
        removeAt(tags.length - 1);
      }
    };

    const wrapperClass = cn(
      controlWrapperBase,
      controlWrapperVariant[variant],
      controlSize[size],
      className,
    );

    return (
      // biome-ignore lint/a11y/useKeyWithClickEvents: click-anywhere-to-focus mimics a real <input>; the inner <input> handles all keyboard interaction.
      <div
        className={wrapperClass}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-invalid={invalid || undefined}
        data-focus-within={focused || undefined}
        style={style}
        onClick={() => inputNodeRef.current?.focus()}
      >
        <div className={tagsRow}>
          {tags.map((t, index) => {
            const remove = () => removeAt(index);
            if (renderTag)
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: tag values can repeat if `unique={false}`; the `${value}-${index}` composite is the stable identity.
                <span key={`${t}-${index}`}>{renderTag(t, index, remove)}</span>
              );
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: see above — stable composite key.
              <span key={`${t}-${index}`} className={tagClass}>
                <span>{t}</span>
                {!readOnly && !disabled ? (
                  <button
                    type="button"
                    className={tagRemove}
                    aria-label={`Remove ${t}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove();
                    }}
                  >
                    <X />
                  </button>
                ) : null}
              </span>
            );
          })}
          <input
            ref={mergedRef}
            id={id}
            name={name}
            aria-label={label ?? props['aria-label']}
            placeholder={tags.length === 0 ? placeholder : undefined}
            className={inlineInput}
            value={draft}
            list={suggestions ? `${id}-suggestions` : undefined}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={invalid || undefined}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              if (draft.trim() !== '') commit(draft);
            }}
          />
          {suggestions ? (
            <datalist id={`${id}-suggestions`}>
              {suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}
        </div>
      </div>
    );
  },
);
