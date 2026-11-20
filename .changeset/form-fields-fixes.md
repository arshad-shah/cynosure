---
"@arshad-shah/cynosure": patch
---

Form fields: Enter in a Form now submits the value a NumberField, DateField, TimeField or ColorField has just committed (it sent the one before). DateField's arrows skip unavailable dates. A disabled Rating is left out of the form, and Rating and PathField follow a form reset. NumberField rejects text with characters it does not know (it read "12abc3" as 123) and reads every script's decimal digits, full-width ones included. NumberField, DateField, TimeField and ColorField leave Enter and the arrows to an input method while it composes. ColorField's invalid text blocks the form, as DateField's does. A RadioGroup without `name` submits nothing.
