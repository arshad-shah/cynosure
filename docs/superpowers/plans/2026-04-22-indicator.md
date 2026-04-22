# Indicator Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `Indicator` wrapper primitive that positions the existing `<Badge>` onto a corner of an arbitrary child element (icon button, avatar, sidebar item).

**Architecture:** `Indicator` is a thin positioning wrapper: a `<span>` with `position: relative` containing the child plus an absolutely positioned inner `<Badge>`. All visual concerns (color, shape, dot mode, icon) are delegated to the existing `Badge`. Placement maps to logical CSS (`inset-inline-start/end`, `top/bottom`) via four `styleVariants`. Visibility is controlled by an `invisible` prop or `hideOn(content)` predicate and implemented as `visibility: hidden` (not `display: none`) so the layout does not reflow.

**Tech Stack:** React 18, TypeScript, vanilla-extract (`.css.ts`), Vitest + @testing-library/react. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-22-indicator-design.md`

---

## Pre-flight

- Workdir: `packages/react/src/feedback/Indicator/` (new).
- Paths below are relative to repo root `/Users/ShahA/Documents/practice/cynosure`.
- Run tests from package dir: `cd packages/react && pnpm test <path>`.
- All style values use `vars.*` tokens from `packages/react/src/styles/vars.css.ts`. **Known good token aliases:** `vars.color.accent.solid` (not `strong`), `vars.radius.full` (not `pill`), no `vars.space['2.5']` step — use `2` or `3`.
- Intra-package imports use `.js` extensions (ESM).
- Biome runs via lint-staged on commit. Import-ordering + formatting may be rewritten — that's fine.

---

## Task 1: Scaffold file structure + barrel export

**Files:**
- Create: `packages/react/src/feedback/Indicator/index.ts`
- Create: `packages/react/src/feedback/Indicator/Indicator.css.ts` (empty placeholder)
- Create: `packages/react/src/feedback/Indicator/Indicator.tsx` (empty placeholder)
- Modify: `packages/react/src/feedback/index.ts`

- [ ] **Step 1: Create placeholder `Indicator.tsx`**

```tsx
// packages/react/src/feedback/Indicator/Indicator.tsx
// Filled in by Task 3. Placeholder so the barrel compiles.
export {};
```

- [ ] **Step 2: Create placeholder `Indicator.css.ts`**

```ts
// packages/react/src/feedback/Indicator/Indicator.css.ts
// Filled in by Task 2.
export {};
```

- [ ] **Step 3: Create barrel `index.ts`**

```ts
// packages/react/src/feedback/Indicator/index.ts
export {};
// Populated by Task 3 after the component lands.
```

- [ ] **Step 4: Add to feedback barrel**

Edit `packages/react/src/feedback/index.ts`. After the line `export * from './ToggleGroup/index.js';` (or wherever the last `export *` is), add:

```ts
export * from './Indicator/index.js';
```

Keep surrounding lines unchanged. Biome may re-sort on commit; do not fight it.

- [ ] **Step 5: Typecheck**

```bash
cd packages/react && pnpm typecheck
```

Expected: PASS (no errors introduced; `export {}` modules are valid).

- [ ] **Step 6: Commit**

```bash
git add packages/react/src/feedback/Indicator packages/react/src/feedback/index.ts
git commit -m "chore(indicator): scaffold Indicator directory and barrel"
```

---

## Task 2: Write `Indicator.css.ts` with positioning styles

**Files:**
- Modify: `packages/react/src/feedback/Indicator/Indicator.css.ts`

- [ ] **Step 1: Replace file contents**

```ts
// packages/react/src/feedback/Indicator/Indicator.css.ts
import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../styles/vars.css.js';

export const indicatorRoot = style({
  position: 'relative',
  display: 'inline-flex',
  verticalAlign: 'middle',
});

/**
 * Wraps the inner <Badge> so we can position it without touching Badge's
 * own styles. Uses a CSS variable for the offset so consumers can pass it
 * via the `offset` prop → inline `style`.
 */
export const indicatorBadgeWrapper = style({
  position: 'absolute',
  vars: {
    '--indicator-offset': '0px',
  },
  pointerEvents: 'none',
  zIndex: 1,
});

export const indicatorHidden = style({
  visibility: 'hidden',
});

export const indicatorPlacement = styleVariants({
  'top-end': {
    top: 0,
    insetInlineEnd: 0,
    transform:
      'translate(calc(50% + var(--indicator-offset)), calc(-50% - var(--indicator-offset)))',
  },
  'top-start': {
    top: 0,
    insetInlineStart: 0,
    transform:
      'translate(calc(-50% - var(--indicator-offset)), calc(-50% - var(--indicator-offset)))',
  },
  'bottom-end': {
    bottom: 0,
    insetInlineEnd: 0,
    transform:
      'translate(calc(50% + var(--indicator-offset)), calc(50% + var(--indicator-offset)))',
  },
  'bottom-start': {
    bottom: 0,
    insetInlineStart: 0,
    transform:
      'translate(calc(-50% - var(--indicator-offset)), calc(50% + var(--indicator-offset)))',
  },
});

// vars imported only to ensure path resolves; not directly used yet.
void vars;
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/react && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/feedback/Indicator/Indicator.css.ts
git commit -m "feat(indicator): add positioning styles with placement variants"
```

---

## Task 3: Write failing tests for `Indicator`

**Files:**
- Create: `packages/react/src/feedback/__tests__/Indicator.test.tsx`

- [ ] **Step 1: Create test file**

```tsx
// packages/react/src/feedback/__tests__/Indicator.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Indicator } from '../Indicator/index.js';

describe('Indicator', () => {
  it('renders the single child untouched', () => {
    render(
      <Indicator content="3">
        <button type="button">child</button>
      </Indicator>,
    );
    const child = screen.getByRole('button', { name: 'child' });
    expect(child).toBeInTheDocument();
    expect(child).not.toHaveAttribute('aria-label');
  });

  it('renders the content as an accessible status by default', () => {
    render(
      <Indicator content="3">
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('3');
  });

  it('sets data-placement on the badge wrapper', () => {
    render(
      <Indicator content="1" placement="bottom-start">
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('data-placement', 'bottom-start');
  });

  it('defaults placement to top-end', () => {
    render(
      <Indicator content="1">
        <button type="button">child</button>
      </Indicator>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('data-placement', 'top-end');
  });

  it('forwards offset as an inline --indicator-offset CSS variable', () => {
    render(
      <Indicator content="1" offset={6}>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status');
    expect(status.getAttribute('style') ?? '').toContain('--indicator-offset: 6px');
  });

  it('invisible keeps the badge in the DOM but hidden', () => {
    render(
      <Indicator content="3" invisible>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status', { hidden: true });
    expect(status).toHaveStyle({ visibility: 'hidden' });
  });

  it('hideOn predicate hides the badge when it returns true', () => {
    render(
      <Indicator content={0} hideOn={(v) => v === 0}>
        <button type="button">child</button>
      </Indicator>,
    );
    const status = screen.getByRole('status', { hidden: true });
    expect(status).toHaveStyle({ visibility: 'hidden' });
  });

  it('dot-only indicator without label is aria-hidden', () => {
    render(
      <Indicator dot>
        <button type="button">child</button>
      </Indicator>,
    );
    // When aria-hidden, role="status" is removed.
    expect(screen.queryByRole('status')).toBeNull();
    const wrapper = screen.getByTestId('indicator-badge-wrapper');
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('aria-label prop overrides content-derived label', () => {
    render(
      <Indicator content="3" aria-label="Three unread messages">
        <button type="button">child</button>
      </Indicator>,
    );
    expect(screen.getByRole('status')).toHaveAccessibleName('Three unread messages');
  });

  it('throws when given more than one child', () => {
    // Suppress React's error boundary noise for this assertion.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <Indicator content="1">
          <span>a</span>
          <span>b</span>
        </Indicator>,
      ),
    ).toThrow();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Add missing vitest import**

The test references `vi` — add it to the imports at the top:

```tsx
import { describe, expect, it, vi } from 'vitest';
```

(Replace the existing `import { describe, expect, it } from 'vitest';` line.)

- [ ] **Step 3: Run — expect fail**

```bash
cd packages/react && pnpm test src/feedback/__tests__/Indicator.test.tsx
```

Expected: FAIL — `Indicator` export not found (placeholder `export {}` has no `Indicator`).

- [ ] **Step 4: Commit the failing tests**

```bash
git add packages/react/src/feedback/__tests__/Indicator.test.tsx
git commit -m "test(indicator): add failing behavior tests"
```

---

## Task 4: Implement `Indicator.tsx`

**Files:**
- Modify: `packages/react/src/feedback/Indicator/Indicator.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// packages/react/src/feedback/Indicator/Indicator.tsx
import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
} from 'react';
import { Badge } from '../Badge/Badge.js';
import type { BadgeColorScheme, BadgeSize, BadgeVariant } from '../Badge/Badge.js';
import { cn } from '../../utils/cn.js';
import {
  indicatorBadgeWrapper,
  indicatorHidden,
  indicatorPlacement,
  indicatorRoot,
} from './Indicator.css.js';

export type IndicatorPlacement = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface IndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Content rendered inside the badge. Omit for dot mode. */
  content?: ReactNode;
  /** Render as a bare coloured dot. */
  dot?: boolean;
  /** Corner the badge hugs. Default `'top-end'`. */
  placement?: IndicatorPlacement;
  /** Inset offset in px. Positive moves the badge further outside the child. Default 0. */
  offset?: number;
  /** Hide the badge entirely while preserving layout. */
  invisible?: boolean;
  /** Predicate variant of `invisible`, evaluated against `content`. */
  hideOn?: (content: ReactNode) => boolean;
  /** Forwarded to the inner <Badge>. */
  colorScheme?: BadgeColorScheme;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  /** The element the indicator decorates. Exactly one React element. */
  children: ReactElement;
  /** Override screen-reader label. */
  'aria-label'?: string;
}

export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(function Indicator(
  {
    content,
    dot = false,
    placement = 'top-end',
    offset = 0,
    invisible,
    hideOn,
    colorScheme = 'neutral',
    variant = 'solid',
    size = 'xs',
    icon,
    children,
    className,
    style,
    'aria-label': ariaLabel,
    ...rest
  },
  ref,
) {
  // Enforce single-child contract — throws with a React-native error.
  const onlyChild = Children.only(children);

  const isHidden = Boolean(invisible) || (hideOn ? hideOn(content) : false);
  const isDecorative = dot && !ariaLabel && (content === undefined || content === null);

  const derivedLabel =
    ariaLabel ??
    (typeof content === 'string' || typeof content === 'number' ? String(content) : undefined);

  const wrapperStyle: CSSProperties = {
    ['--indicator-offset' as string]: `${offset}px`,
  };

  const badgeWrapperProps = isDecorative
    ? { 'aria-hidden': true as const, 'data-testid': 'indicator-badge-wrapper' }
    : {
        role: 'status' as const,
        'aria-label': derivedLabel,
        'data-testid': 'indicator-badge-wrapper',
      };

  return (
    <span ref={ref} className={cn(indicatorRoot, className)} style={style} {...rest}>
      {onlyChild}
      <span
        data-placement={placement}
        className={cn(
          indicatorBadgeWrapper,
          indicatorPlacement[placement],
          isHidden && indicatorHidden,
        )}
        style={wrapperStyle}
        {...badgeWrapperProps}
      >
        <Badge
          dot={dot}
          colorScheme={colorScheme}
          variant={variant}
          size={size}
          icon={icon}
          shape="pill"
        >
          {dot ? undefined : content}
        </Badge>
      </span>
    </span>
  );
});
```

- [ ] **Step 2: Update barrel**

Replace `packages/react/src/feedback/Indicator/index.ts` with:

```ts
// packages/react/src/feedback/Indicator/index.ts
export { Indicator } from './Indicator.js';
export type { IndicatorPlacement, IndicatorProps } from './Indicator.js';
```

- [ ] **Step 3: Run tests — expect pass**

```bash
cd packages/react && pnpm test src/feedback/__tests__/Indicator.test.tsx
```

Expected: all 10 tests PASS.

**If any test fails:**
- *`data-placement` assertion failing* → confirm the attribute is on the inner badge wrapper span (the one queried as `role="status"`), not the outer root.
- *`--indicator-offset` assertion failing* → React normalises CSS custom properties; the test asserts `style` attribute string contains the literal. If React strips it, assert via `(element as HTMLElement).style.getPropertyValue('--indicator-offset') === '6px'` instead.
- *`aria-hidden` test failing for dot mode* → the condition `dot && !ariaLabel && content == null` must exactly match. Re-read that line; do not loosen the check.

- [ ] **Step 4: Typecheck**

```bash
cd packages/react && pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/react/src/feedback/Indicator/Indicator.tsx \
        packages/react/src/feedback/Indicator/index.ts
git commit -m "feat(indicator): implement overlay wrapper around Badge"
```

---

## Task 5: Write Storybook stories

**Files:**
- Create: `packages/react/src/feedback/Indicator/Indicator.stories.tsx`

- [ ] **Step 1: Create the stories file**

```tsx
// packages/react/src/feedback/Indicator/Indicator.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BellIcon, InboxIcon, UserIcon } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { Avatar } from '../Avatar/Avatar.js';
import { Inline } from '../../primitives/layout/Inline/Inline.js';
import { Stack } from '../../primitives/layout/Stack/Stack.js';
import { Text } from '../../typography/Text/Text.js';
import {
  Sidebar,
  SidebarBody,
  SidebarItem,
  SidebarNav,
  SidebarProvider,
} from '../../navigation/Sidebar/index.js';
import { Indicator } from './index.js';

const meta: Meta<typeof Indicator> = {
  title: 'Feedback/Indicator',
  component: Indicator,
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof Indicator>;

const Square = ({ label = 'child' }: { label?: string }): ReactElement => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 8,
      background: 'var(--cynosure-color-background-canvas, #f3f4f6)',
      border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
      fontSize: 12,
    }}
  >
    {label}
  </span>
);

export const Default: Story = {
  render: () => (
    <Indicator content="3" colorScheme="danger">
      <button
        type="button"
        aria-label="Notifications"
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <BellIcon size={18} />
      </button>
    </Indicator>
  ),
};

export const Dot: Story = {
  render: () => (
    <Indicator dot colorScheme="success" aria-label="Online">
      <Avatar size="md" fallback={<UserIcon size={18} />} />
    </Indicator>
  ),
};

export const Placements: Story = {
  render: () => (
    <Inline gap="6" align="center">
      <Stack gap="2" align="center">
        <Indicator content="1" placement="top-start">
          <Square label="t-s" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          top-start
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="top-end">
          <Square label="t-e" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          top-end
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="bottom-start">
          <Square label="b-s" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          bottom-start
        </Text>
      </Stack>
      <Stack gap="2" align="center">
        <Indicator content="1" placement="bottom-end">
          <Square label="b-e" />
        </Indicator>
        <Text size="xs" color="fg.muted">
          bottom-end
        </Text>
      </Stack>
    </Inline>
  ),
};

export const Offset: Story = {
  render: () => (
    <Inline gap="6" align="center">
      {[-4, 0, 4, 8].map((o) => (
        <Stack key={o} gap="2" align="center">
          <Indicator content="1" offset={o}>
            <Square />
          </Indicator>
          <Text size="xs" color="fg.muted">
            offset={o}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const ColorSchemes: Story = {
  render: () => (
    <Inline gap="4" align="center">
      {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map((cs) => (
        <Stack key={cs} gap="2" align="center">
          <Indicator content="!" colorScheme={cs}>
            <Square />
          </Indicator>
          <Text size="xs" color="fg.muted">
            {cs}
          </Text>
        </Stack>
      ))}
    </Inline>
  ),
};

export const MaxCount: Story = {
  render: () => {
    const count = 142;
    return (
      <Indicator content={count > 99 ? '99+' : count} colorScheme="danger">
        <button
          type="button"
          aria-label="Inbox"
          style={{
            padding: 8,
            borderRadius: 8,
            border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
            background: 'transparent',
          }}
        >
          <InboxIcon size={18} />
        </button>
      </Indicator>
    );
  },
};

export const InvisibleToggle: Story = {
  render: () => {
    function Demo(): ReactElement {
      const [count, setCount] = useState(3);
      return (
        <Stack gap="3" align="center">
          <Indicator content={count} hideOn={(v) => v === 0} colorScheme="danger">
            <button
              type="button"
              aria-label="Notifications"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
                background: 'transparent',
              }}
            >
              <BellIcon size={18} />
            </button>
          </Indicator>
          <Inline gap="2">
            <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              -
            </button>
            <Text>{count}</Text>
            <button type="button" onClick={() => setCount((c) => c + 1)}>
              +
            </button>
          </Inline>
        </Stack>
      );
    }
    return <Demo />;
  },
};

export const OnSidebarItem: Story = {
  render: () => (
    <SidebarProvider>
      <div
        style={{
          display: 'flex',
          width: 280,
          minHeight: 200,
          border: '1px solid var(--cynosure-color-border-subtle, #e5e7eb)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <Sidebar aria-label="Primary">
          <SidebarBody>
            <SidebarNav aria-label="Primary">
              <Indicator dot colorScheme="danger" aria-label="New messages">
                <SidebarItem icon={<InboxIcon size={18} />} label="Inbox" />
              </Indicator>
            </SidebarNav>
          </SidebarBody>
        </Sidebar>
      </div>
    </SidebarProvider>
  ),
};
```

- [ ] **Step 2: Typecheck**

```bash
cd packages/react && pnpm typecheck
```

Expected: PASS.

**If typecheck fails because `Avatar` has no `fallback` prop or a Stack/Inline prop doesn't exist**, read the respective component file (`packages/react/src/feedback/Avatar/Avatar.tsx`, `packages/react/src/primitives/layout/Stack/Stack.tsx`) and adjust the story JSX to match the actual API. The *behavior* of the story isn't important; only that it demonstrates the feature and typechecks.

- [ ] **Step 3: Commit**

```bash
git add packages/react/src/feedback/Indicator/Indicator.stories.tsx
git commit -m "docs(indicator): add storybook stories"
```

---

## Task 6: Full sweep

**Files:** none (verification).

- [ ] **Step 1: Run full tests**

```bash
cd packages/react && pnpm test
```

Expected: all tests PASS (628 + the 10 new Indicator tests = 638).

- [ ] **Step 2: Typecheck**

```bash
cd packages/react && pnpm typecheck
```

Expected: PASS, no errors.

- [ ] **Step 3: Lint the new files**

```bash
cd /Users/ShahA/Documents/practice/cynosure && npx biome check \
  packages/react/src/feedback/Indicator \
  packages/react/src/feedback/__tests__/Indicator.test.tsx \
  packages/react/src/feedback/index.ts
```

Expected: "Checked N files in Xms." with no errors.

- [ ] **Step 4: If anything needed a fix-up during the sweep, commit it**

```bash
git status
# If clean, no commit needed. Otherwise:
git add -A
git commit -m "chore(indicator): final sweep fix-ups"
```

---

## Self-Review (done during planning)

**1. Spec coverage**

| Spec requirement | Covered by |
|---|---|
| `Indicator` wraps single child, `Children.only` throws on multiple | Task 4 implementation; Task 3 test "throws when given more than one child" |
| Renders child untouched | Task 3 test "renders the single child untouched" |
| Badge is absolutely positioned | Task 2 `indicatorBadgeWrapper` + `indicatorPlacement` variants |
| Four placements via `data-placement` + logical CSS | Task 2 variants; Task 3 test "sets data-placement" and "defaults to top-end" |
| `offset` via `--indicator-offset` CSS variable | Task 2 variable in `indicatorBadgeWrapper`; Task 4 inline `style`; Task 3 test "forwards offset" |
| `invisible` → `visibility: hidden` | Task 2 `indicatorHidden`; Task 3 test "invisible keeps the badge in the DOM but hidden" |
| `hideOn` predicate | Task 4 implementation; Task 3 test "hideOn predicate hides" |
| Forwards `dot`/`colorScheme`/`variant`/`size`/`icon` to Badge | Task 4 `<Badge …>` pass-through. No test specifically asserts each forwarded prop class; the stories visually demonstrate. Acceptable for now. |
| Decorative dot → `aria-hidden` | Task 4 `isDecorative` branch; Task 3 test "dot-only indicator without label is aria-hidden" |
| `role="status"` + derived label for text content | Task 4 `badgeWrapperProps`; Task 3 tests "renders the content as an accessible status" and "aria-label prop overrides" |
| No breaking changes to Badge or SidebarItem | No files in those directories are modified |
| Stories for default/dot/placements/offset/colorSchemes/maxCount/invisibleToggle/onSidebarItem | Task 5 |

**2. Placeholder scan:** no TBDs, no "similar to Task N", all code blocks complete. The story-file fallback instruction ("if Avatar has no `fallback` prop, adjust") is a concrete recovery path, not a deferral.

**3. Type consistency:** `IndicatorPlacement` used in `placement` prop (Task 4) and as the key of `indicatorPlacement` styleVariants (Task 2) — same four string literals. `BadgeColorScheme`, `BadgeVariant`, `BadgeSize` imported from `../Badge/Badge.js` in Task 4; they exist (verified against existing `Badge.tsx`).
