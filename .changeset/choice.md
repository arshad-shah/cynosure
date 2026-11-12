---
"@arshad-shah/cynosure": minor
---

New `Choice`: the row a choice control sits in (the control, its label and description, the whole row clickable), with `strikeWhenChecked` and the tokens `--cy-choice-gap`, `--cy-choice-done-color` and `--cy-choice-strike-width`. Checkbox, Switch and RadioGroup's options are now Choice rows, and each owns its control's look in its own stylesheet: `styles/checkbox.css` holds only the box, the new `styles/switch.css` the switch, `styles/radio-group.css` the radio, and `styles/choice.css` the shared row (it used to be ChoiceBase's stylesheet, now `styles/choice-base.css`). Import Choice's stylesheet with Checkbox's, Switch's or RadioGroup's when you load stylesheets one by one (`styles/manifest.json` lists them). Props, tokens and the look are unchanged; `--cy-checkbox-done-color` and `--cy-checkbox-strike-width` now set the row's done tokens. `ChoiceControlProps` and `ChoiceInput` are exported for building new choice controls.
