# EmptyState

What to show where content will be: no items yet, no search results, nothing selected. An icon, a heading, a sentence and the next step.

```tsx
<EmptyState
  icon={folderOpen}
  title="No projects yet"
  description="Projects group your captures, notes and exports."
  actions={
    <Button variant="solid" tone="accent">
      Create a project
    </Button>
  }
/>;
```

| Prop           | Default | Notes                                                                           |
| -------------- | ------- | ------------------------------------------------------------------------------- |
| `icon`         | –       | Facet icon, decorative                                                          |
| `title`        | –       | A real heading                                                                  |
| `headingLevel` | `3`     | 1 to 6, to fit the page outline; 1 when the empty state is the page (not found) |
| `description`  | –       | One or two sentences                                                            |
| `actions`      | –       | Buttons for the next step; they wrap when narrow                                |
| `size`         | `md`    | `sm` for panels and popups                                                      |

Tokens: `--cy-empty-state-gap`, `--cy-empty-state-padding`, `--cy-empty-state-max-width`.
