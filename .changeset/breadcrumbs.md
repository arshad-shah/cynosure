---
"@arshad-shah/cynosure": minor
---

New `Breadcrumbs` component: the trail from the top of a site or app to the current page, as a "Breadcrumb" navigation landmark with an ordered list. Pass `items` (`label`, `href`, `onClick`, `icon`); every item but the last is a link or a button, and the last is the current page (`aria-current="page"`). `maxItems` collapses the middle of a long trail into a menu, long names are cut with an ellipsis and the trail wraps in narrow containers.
