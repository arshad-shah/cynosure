/**
 * The canvas: examples of a component, live. The stage shows one on a dotted ground, at desktop, tablet or phone
 * width and on the page's colours or dark; its source opens underneath. With several examples, tabs pick one. The
 * examples are the component's own stories, loaded from the library's source when the canvas first appears.
 */

import examples from "virtual:docs/examples";
import site from "virtual:docs/site";
import {
  Button,
  Card,
  CodeBlock,
  CynosureTheme,
  EmptyState,
  IconButton,
  SegmentedControl,
  Skeleton,
  Tab,
  TabList,
  Tabs,
  Toolbar,
} from "@arshad-shah/cynosure";
import {
  alert,
  code as codeIcon,
  external,
  monitor,
  moon,
  play,
  smartphone,
  sun,
  tablet,
} from "@arshad-shah/cynosure/icons";
import {
  Component,
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Example } from "../types";
import { colourJsx, writeJsx } from "./jsx";
import { Tokens } from "./Markdown";

type Mode = "light" | "dark";
type Args = Record<string, unknown>;
type Render = (args: Args, context: Args) => ReactNode;
type Decorator = (story: ComponentType, context: Args) => ReactNode;
interface StoryShape {
  args?: Args;
  render?: Render;
  decorators?: Decorator[];
  component?: ComponentType<Args>;
}
type StoriesModule = Record<string, StoryShape | undefined>;

const WIDTHS = [
  { value: "desktop", label: "Desktop width", icon: monitor },
  { value: "tablet", label: "Tablet width", icon: tablet },
  { value: "phone", label: "Phone width", icon: smartphone },
];

/**
 * A story as a component, composed the way Storybook does: shared args under its own, its render or the component.
 * What it renders is also handed to `seen`, so the canvas can write the example's code.
 */
function compose(module: StoriesModule, name: string, seen: (rendered: ReactNode) => void): ComponentType {
  const meta = module.default ?? {};
  const story = module[name] ?? {};
  const args = { ...meta.args, ...story.args };
  const context = { args, globals: {}, parameters: {}, viewMode: "docs", name };
  const render = story.render ?? meta.render;
  const Subject = meta.component;
  const Inner = () => {
    const rendered = render ? render(args, context) : Subject ? <Subject {...args} /> : null;
    useEffect(() => seen(rendered));
    return <>{rendered}</>;
  };
  return [...(story.decorators ?? []), ...(meta.decorators ?? [])].reduce<ComponentType>(
    (Wrapped, decorator) => () => <>{decorator(Wrapped, context)}</>,
    Inner,
  );
}

function Story({
  module,
  name,
  known,
  onCode,
}: {
  module: StoriesModule;
  name: string;
  known: ReadonlySet<string>;
  onCode: (code: string | null) => void;
}) {
  // One component per story, kept across re-renders so the example's own state survives the canvas controls.
  const Composed = useMemo(
    () => compose(module, name, (rendered) => onCode(writeJsx(rendered, known, site.package))),
    [module, name, known, onCode],
  );
  return <Composed />;
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    if (this.state.failed)
      return <EmptyState size="sm" icon={alert} title="This example could not be shown" headingLevel={3} />;
    return this.props.children;
  }
}

export function Canvas({
  stories,
  items,
  storybook,
  exports,
}: {
  /** Key of the stories file in `virtual:docs/examples`. */
  stories: string;
  items: Example[];
  /** The component's Storybook docs address, when the site has a Storybook beside it. */
  storybook?: string | undefined;
  /** Names the package exports: the components an example's code may name. */
  exports: string[];
}) {
  const [current, setCurrent] = useState(items[0]?.story ?? "");
  const [mode, setMode] = useState<Mode | null>(null);
  const [width, setWidth] = useState("desktop");
  const [showCode, setShowCode] = useState(false);
  const [module, setModule] = useState<StoriesModule | null>(null);
  const [failed, setFailed] = useState(false);
  // How many times a gated example has been opened: 0 is not yet.
  const [run, setRun] = useState(0);
  // Examples found, once rendered, to open over the page by themselves: they wait to be asked, like the ones the
  // build already marked.
  const [caught, setCaught] = useState<ReadonlySet<string>>(new Set());
  const known = useMemo(() => new Set(exports), [exports]);
  const [code, setCode] = useState<string | null>(null);
  const onCode = useCallback(
    (next: string | null) => setCode((previous) => (previous === next ? previous : next)),
    [],
  );

  useEffect(() => {
    let live = true;
    setModule(null);
    setFailed(false);
    const load = examples[stories];
    if (!load) return setFailed(true);
    load().then(
      (loaded) => live && setModule(loaded as StoriesModule),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [stories]);

  const dark = mode === "dark";
  const kebab = current.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const inStorybook = storybook?.replace(/\/docs\/(.+)--docs$/, `/story/$1--${kebab}`);

  const found = items.find((candidate) => candidate.story === current) ?? items[0];
  const gated = Boolean(found && (found.gated || caught.has(found.story)));
  const frame = useRef<HTMLDivElement>(null);
  const story = found?.story;
  useEffect(() => {
    if (!module || !story || gated || run > 0) return;
    // A modal that this example opened on its own (not one already open elsewhere on the page).
    const opened = [...document.querySelectorAll("dialog:modal")].some((dialog) =>
      Boolean(frame.current?.contains(dialog)),
    );
    if (opened) setCaught((previous) => new Set(previous).add(story));
  }, [module, story, gated, run]);
  if (!found) return null;
  const item = { ...found, gated };
  const tokens = code ? colourJsx(code) : null;

  return (
    <Card variant="outline" padding="none" className="docs-canvas">
      <div className="docs-canvas-bar">
        {items.length > 1 ? (
          <Tabs
            value={item.story}
            onChange={(next) => {
              setCurrent(next);
              setRun(0);
            }}
            size="sm"
            variant="soft"
          >
            <TabList label="Examples">
              {items.map((each) => (
                <Tab key={each.story} value={each.story}>
                  {each.label}
                </Tab>
              ))}
            </TabList>
          </Tabs>
        ) : (
          <span className="docs-canvas-name">{item.label}</span>
        )}
        <Toolbar label={`Canvas: ${item.label}`}>
          <SegmentedControl
            label="Canvas width"
            size="sm"
            iconOnly
            value={width}
            onChange={setWidth}
            options={WIDTHS}
          />
          <IconButton
            size="sm"
            variant="ghost"
            icon={dark ? sun : moon}
            label={dark ? "Show on the page's colours" : "Show on dark"}
            onClick={() => setMode(dark ? null : "dark")}
          />
          {code && (
            <IconButton
              size="sm"
              variant={showCode ? "soft" : "ghost"}
              icon={codeIcon}
              label={showCode ? "Hide the code" : "Show the code"}
              aria-pressed={showCode}
              onClick={() => setShowCode(!showCode)}
            />
          )}
          {inStorybook && (
            <IconButton
              size="sm"
              variant="ghost"
              icon={external}
              label="Open in Storybook"
              href={inStorybook}
              target="_blank"
            />
          )}
        </Toolbar>
      </div>
      <CynosureTheme {...(mode ? { mode } : {})}>
        <div className="docs-stage">
          <div ref={frame} className="docs-stage-frame" data-width={width}>
            {failed ? (
              <EmptyState size="sm" icon={alert} title="This example could not be loaded" headingLevel={3} />
            ) : module && item.gated && run === 0 ? (
              <Button icon={play} onClick={() => setRun(1)}>
                Open the example
              </Button>
            ) : module ? (
              <>
                <Boundary key={`${item.story}-${run}`}>
                  <Story module={module} name={item.story} known={known} onCode={onCode} />
                </Boundary>
                {item.gated && (
                  <Button size="sm" variant="ghost" icon={play} onClick={() => setRun(run + 1)}>
                    Open it again
                  </Button>
                )}
              </>
            ) : (
              <Skeleton shape="block" className="docs-stage-loading" />
            )}
          </div>
        </div>
      </CynosureTheme>
      {showCode && code && tokens && (
        <CodeBlock
          className="docs-canvas-code"
          language="tsx"
          code={code}
          highlight={() => <Tokens lines={tokens} />}
        />
      )}
    </Card>
  );
}
