/**
 * The icon gallery: every icon of the sets named in the config, searched as you type. Pressing an icon copies the
 * line that imports it (or the element that draws it). The sets are loaded when the page opens, so no other page
 * carries them.
 */

import {
  Card,
  EmptyState,
  Icon,
  LoadingDots,
  SearchField,
  SegmentedControl,
  Stack,
  useToast,
} from "@arshad-shah/cynosure";
import { type IconData, search } from "@arshad-shah/cynosure/icons";
import { useEffect, useMemo, useState } from "react";
import type { IconSet } from "../config";

interface Entry {
  /** The name it is imported by. */
  id: string;
  icon: IconData;
  /** Everything a search can match, in lower case. */
  words: string;
}
interface Loaded {
  set: IconSet;
  entries: Entry[];
}

const isIcon = (value: unknown): value is IconData =>
  typeof value === "object" && value !== null && "body" in value && "name" in value;
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** What is copied for an icon, by the chosen form. */
const FORMS = {
  import: (id: string, from: string) => `import { ${id} } from "${from}";`,
  element: (id: string) => `<Icon icon={${id}} />`,
} as const;
type Form = keyof typeof FORMS;

export function Gallery({ sets }: { sets: IconSet[] }) {
  const { toast } = useToast();
  const [loaded, setLoaded] = useState<Loaded[] | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<Form>("import");

  useEffect(() => {
    let current = true;
    void Promise.all(
      sets.map(async (set) => {
        const none: Readonly<Record<string, readonly string[]>> = {};
        const [icons, keywords] = await Promise.all([set.load(), set.keywords?.() ?? none]);
        return {
          set,
          entries: Object.entries(icons)
            .filter((pair): pair is [string, IconData] => isIcon(pair[1]))
            .map(([id, icon]) => ({
              id,
              icon,
              words: [id, icon.name, icon.category, icon.brand?.title, ...(keywords[icon.name] ?? [])]
                .join(" ")
                .toLowerCase(),
            })),
        };
      }),
    ).then((all) => {
      if (current) setLoaded(all);
    });
    return () => {
      current = false;
    };
  }, [sets]);

  // Every word typed must be found: "arrow up" finds arrow-up and arrow-up-right, not arrow-down.
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return (loaded ?? []).map(({ set, entries }) => ({
      set,
      entries: entries.filter((entry) => words.every((word) => entry.words.includes(word))),
    }));
  }, [loaded, query]);
  const count = shown.reduce((sum, { entries }) => sum + entries.length, 0);

  const copy = async (entry: Entry, set: IconSet) => {
    const text = FORMS[form](entry.id, set.from);
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: text, tone: "success" });
    } catch {
      toast({ title: "Could not copy", description: text, tone: "danger" });
    }
  };

  return (
    <section className="docs-gallery" aria-label="Icon gallery">
      <div className="docs-gallery-tools">
        <SearchField
          label="Search icons"
          placeholder="Try delete, arrow or settings"
          value={query}
          onChange={setQuery}
        />
        <SegmentedControl
          label="A press copies"
          value={form}
          onChange={(value) => setForm(value as Form)}
          options={[
            { value: "import", label: "Import" },
            { value: "element", label: "Element" },
          ]}
        />
      </div>
      {loaded === null ? (
        <LoadingDots label="Loading icons" />
      ) : (
        <>
          <p className="docs-small" role="status">
            {query
              ? `${count} of ${loaded.reduce((sum, { entries }) => sum + entries.length, 0)} match. `
              : `${loaded.map(({ set, entries }) => `${entries.length} ${set.label.toLowerCase()}`).join(", ")}. `}
            Press one to copy {form === "import" ? "its import" : "its element"}.
          </p>
          {/* One frame of fixed height that scrolls, so the gallery never makes the page long. */}
          <div className="docs-gallery-frame">
            {count === 0 && (
              <EmptyState
                size="sm"
                icon={search}
                title="No icon matches"
                description="Try another word for it, or a category such as arrows, files or media."
              />
            )}
            {shown.map(({ set, entries }) => {
              const groups = new Map<string, Entry[]>();
              for (const entry of entries)
                groups.set(entry.icon.category, [...(groups.get(entry.icon.category) ?? []), entry]);
              return [...groups]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                  <Stack key={`${set.from}-${category}`} gap="2">
                    {/* A set of one category (brand marks) is named by the set; others by the category. */}
                    <h3 className="docs-gallery-heading">
                      {groups.size === 1 && category === set.label.toLowerCase()
                        ? set.label
                        : sentence(category)}
                    </h3>
                    <div className="docs-gallery-grid">
                      {items.map((entry) => (
                        <Card
                          key={entry.id}
                          variant="outline"
                          padding="sm"
                          aria-label={`Copy ${entry.icon.brand?.title ?? entry.id}`}
                          onClick={() => void copy(entry, set)}
                        >
                          <Stack gap="2" align="center">
                            <Icon icon={entry.icon} size={24} />
                            <span className="docs-gallery-name">{entry.id}</span>
                          </Stack>
                        </Card>
                      ))}
                    </div>
                  </Stack>
                ));
            })}
          </div>
        </>
      )}
    </section>
  );
}
