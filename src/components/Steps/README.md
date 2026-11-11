# Steps

Progress through an ordered flow: a setup wizard, a checkout, an import. Numbered steps, finished ones ticked, the current one marked, horizontal or vertical. Optionally the steps are buttons that go back (or forward) to a step.

```tsx
import { Steps } from "@arshad-shah/cynosure";

const steps = [
  { id: "account", label: "Account", description: "Email and password" },
  { id: "workspace", label: "Workspace" },
  { id: "done", label: "Done", disabled: true },
];

<Steps steps={steps} current="workspace" />
<Steps steps={steps} current={step} onStepSelect={setStep} orientation="vertical" />;
```

| Prop                  | Default      | Notes                                                                                   |
| --------------------- | ------------ | --------------------------------------------------------------------------------------- |
| `steps`               | –            | `{ id, label, description?, status?, disabled? }`; `status` is `complete` or `error`    |
| `current`             | –            | `id` of the current step: earlier steps are complete, later ones upcoming               |
| `orientation`         | `horizontal` | `horizontal` · `vertical`                                                               |
| `onStepSelect`        | –            | Makes steps buttons; called with the step `id` (not for the current or a disabled step) |
| `size`                | `md`         | `sm` · `md` · `lg`                                                                      |
| `labels`              | –            | `list` ("Progress"), `complete`, `current`, `upcoming`, `error`: read after each label  |
| `className` / `style` | –            | Layout only                                                                             |
- An ordered list named "Progress"; the current step carries `aria-current="step"` and every step says its state ("Account, completed").
- Steps that can be chosen are buttons in tab order; hit area ≥ 24px, ≥ 44px on touch screens.
- Finished steps show a tick on the accent colour; a step marked `error` shows an alert on the danger colour.

## Tokens

- `--cy-steps-marker-size`: diameter of the numbered marker (default: twice the text size)
- `--cy-steps-line-width`: thickness of the line between steps
- `--cy-steps-gap`: space around the lines

## Used by

Onboarding and setup flows, multi-step forms and import wizards in the web apps and extensions (cross-product audit, 2026-11-10).
