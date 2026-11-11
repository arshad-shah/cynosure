/**
 * The page layouts. Which one a page gets follows from its kind: the home page, a guide, a component, the
 * catalogue or the changelog. Every layout is the same data-driven frame (heading, body, "On this page", previous and
 * next) with the parts that kind adds.
 */

import site from "virtual:docs/site";
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  EmptyState,
  Grid,
  Icon,
  IconButton,
  Inline,
  Link,
  Prose,
  SearchField,
  Stack,
  Table,
} from "@arshad-shah/cynosure";
import { github, npm } from "@arshad-shah/cynosure/brands";
import { arrowLeft, arrowRight, edit, external, search } from "@arshad-shah/cynosure/icons";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import config from "../../docs.config";
import type { PageData, PageLink, PropRow, TocEntry } from "../types";
import { Canvas } from "./Canvas";
import { Markdown } from "./Markdown";

const icons = config.icons ?? {};
const blob = `${site.repo}/blob/${site.branch}`;

function Head({ page, children }: { page: PageData; children?: ReactNode }) {
  const trail = [page.section, page.group].filter(Boolean).join(" / ");
  return (
    <header className="docs-head">
      {trail && <p className="docs-eyebrow">{trail}</p>}
      <h1 className="docs-title">{page.title}</h1>
      {page.lead && <p className="docs-lead">{page.lead}</p>}
      {children}
    </header>
  );
}

/** "On this page": the headings, with the one being read marked. */
function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState(entries[0]?.id);
  useEffect(() => {
    setActive(entries[0]?.id);
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));
    if (!headings.length) return;
    const main = document.querySelector("main");
    // The heading nearest the top of the content area is the one being read.
    const observer = new IntersectionObserver(
      (changes) => {
        for (const change of changes) if (change.isIntersecting) setActive(change.target.id);
      },
      { root: main, rootMargin: "0px 0px -75% 0px" },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [entries]);
  if (entries.length < 2) return null;
  return (
    <nav className="docs-toc" aria-label="On this page">
      <p className="docs-eyebrow">On this page</p>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} data-depth={entry.depth} data-active={entry.id === active || undefined}>
            <Link
              href={`#${entry.id}`}
              size="sm"
              tone={entry.id === active ? "accent" : "neutral"}
              className="docs-toc-link"
            >
              {entry.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Neighbour({ link, direction }: { link: PageLink; direction: "previous" | "next" }) {
  const next = direction === "next";
  return (
    <Card variant="outline" href={link.route} className="docs-neighbour" data-direction={direction}>
      <Stack gap="1" align={next ? "end" : "start"}>
        <Inline gap="1" align="center">
          {!next && <Icon icon={arrowLeft} size="sm" tone="muted" />}
          <span className="docs-small">{next ? "Next" : "Previous"}</span>
          {next && <Icon icon={arrowRight} size="sm" tone="muted" />}
        </Inline>
        <strong>{link.title}</strong>
      </Stack>
    </Card>
  );
}

function Foot({ page }: { page: PageData }) {
  return (
    <footer className="docs-foot">
      {(page.previous || page.next) && (
        <div className="docs-neighbours">
          {page.previous ? <Neighbour link={page.previous} direction="previous" /> : <span />}
          {page.next ? <Neighbour link={page.next} direction="next" /> : <span />}
        </div>
      )}
      <div className="docs-colophon">
        <span>
          {site.name} {site.version}
          {site.unreleased && " with unreleased changes"}
        </span>
        <Inline gap="4" wrap>
          {page.source && (
            <Link href={`${blob}/${page.source}`} size="sm" tone="neutral">
              Edit this page
            </Link>
          )}
          {site.unreleased && (
            <Link href={site.url} size="sm" tone="neutral" external>
              Published documentation
            </Link>
          )}
          <Link href="/changelog/" size="sm" tone="neutral">
            Changelog
          </Link>
          {(config.links ?? []).map((item) => (
            <Link key={item.href} href={item.href} size="sm" tone="neutral">
              {item.label}
            </Link>
          ))}
          <Link href={site.repo} size="sm" tone="neutral">
            GitHub
          </Link>
          <Link href={site.npm} size="sm" tone="neutral">
            npm
          </Link>
        </Inline>
      </div>
    </footer>
  );
}

/** The frame every page but the home page shares. */
function Frame({ page, wide, children }: { page: PageData; wide?: boolean; children: ReactNode }) {
  return (
    <div className="docs-page" data-wide={wide || undefined}>
      <article className="docs-article">
        {children}
        <Foot page={page} />
      </article>
      {!wide && <Toc entries={page.toc} />}
    </div>
  );
}

function PropsTable({ name, rows }: { name: string; rows: PropRow[] }) {
  return (
    <Table
      caption={`Every prop of ${name}`}
      captionHidden
      getRowId={(row) => row.name}
      rows={rows}
      columns={[
        {
          key: "name",
          header: "Prop",
          rowHeader: true,
          cell: (row) => (
            <Inline gap="2" align="center">
              <code>{row.name}</code>
              {row.required && (
                <Badge size="sm" tone="accent">
                  Required
                </Badge>
              )}
            </Inline>
          ),
        },
        { key: "type", header: "Type", cell: (row) => <code className="docs-type">{row.type}</code> },
        {
          key: "default",
          header: "Default",
          cell: (row) => (row.default ? <code>{row.default}</code> : null),
        },
        { key: "description", header: "What it does", cell: (row) => row.description },
      ]}
    />
  );
}

function Doc({ page }: { page: PageData }) {
  return (
    <Frame page={page}>
      <Head page={page} />
      <Prose as="div" size="lg" className="docs-prose">
        <Markdown nodes={page.body} />
      </Prose>
    </Frame>
  );
}

function ComponentPage({ page }: { page: PageData }) {
  const component = page.component;
  if (!component) return <Doc page={page} />;
  return (
    <Frame page={page}>
      <Head page={page}>
        <Inline gap="2" wrap>
          <Button size="sm" icon={github} href={component.folder}>
            Source
          </Button>
          {component.storybook && (
            <Button size="sm" icon={external} href={component.storybook}>
              Storybook
            </Button>
          )}
          {page.source && (
            <Button size="sm" variant="ghost" icon={edit} href={`${blob}/${page.source}`}>
              Edit this page
            </Button>
          )}
        </Inline>
      </Head>
      <Prose as="div" size="lg" className="docs-prose">
        <Markdown
          nodes={page.body}
          blocks={{
            canvas: (stories) => {
              const items = stories
                .map((story) => component.examples.find((example) => example.story === story))
                .filter((example): example is NonNullable<typeof example> => Boolean(example));
              return component.stories && items.length ? (
                <div className="docs-block">
                  <Canvas
                    stories={component.stories}
                    items={items}
                    storybook={component.storybook}
                    exports={component.exports}
                  />
                </div>
              ) : null;
            },
            props: () =>
              component.props.length ? (
                <div className="docs-block">
                  <PropsTable name={component.name} rows={component.props} />
                  <p className="docs-small">
                    Generated from the type definitions in {site.package} {site.version}.
                  </p>
                </div>
              ) : null,
          }}
        />
      </Prose>
      {component.examples.length > 0 && (
        <p className="docs-small">
          The examples run the library's source{site.commit ? ` at ${site.commit}` : ""}; the package on npm
          is {site.version}.
        </p>
      )}
    </Frame>
  );
}

function Catalogue({ page }: { page: PageData }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return (page.catalogue ?? [])
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          words.every((word) => `${item.name} ${item.summary} ${group.label}`.toLowerCase().includes(word)),
        ),
      }))
      .filter((group) => group.items.length);
  }, [page.catalogue, query]);
  const total = (page.catalogue ?? []).reduce((sum, group) => sum + group.items.length, 0);
  return (
    <Frame page={page} wide>
      <Head page={{ ...page, lead: `${total} components and foundations, grouped by what they are for.` }} />
      <div className="docs-filter">
        <SearchField
          label="Filter components"
          labelHidden
          placeholder="Filter by name or purpose"
          value={query}
          onChange={setQuery}
        />
      </div>
      {groups.length === 0 && (
        <EmptyState
          icon={search}
          title="No component matches"
          description="Try a shorter word."
          headingLevel={2}
        />
      )}
      {groups.map((group) => (
        <section key={group.label} className="docs-group" aria-label={group.label}>
          <Inline gap="2" align="center">
            <h2 className="docs-heading docs-section-title">{group.label}</h2>
            <Badge size="sm" tone="neutral">
              {group.items.length}
            </Badge>
          </Inline>
          <Grid minItemWidth="16rem" gap="4" as="ul" className="docs-cards">
            {group.items.map((item) => (
              <Card key={item.name} as="li" variant="outline" href={item.route} className="docs-card">
                <Stack gap="1">
                  <strong>{item.name}</strong>
                  <span className="docs-small docs-clamp">{item.summary}</span>
                </Stack>
              </Card>
            ))}
          </Grid>
        </section>
      ))}
    </Frame>
  );
}

function Changelog({ page }: { page: PageData }) {
  return (
    <Frame page={page}>
      <Head page={page} />
      {(page.releases ?? []).map((release, index) => (
        <section key={release.id} className="docs-release" aria-labelledby={release.id}>
          <Inline gap="2" align="center">
            <h2 id={release.id} className="docs-heading docs-section-title">
              {release.version}
            </h2>
            {index === 0 && (
              <Badge size="sm" tone="accent">
                Latest
              </Badge>
            )}
            <IconButton
              size="sm"
              variant="ghost"
              icon={npm}
              label={`${release.version} on npm`}
              href={`${site.npm}/v/${release.version}`}
            />
          </Inline>
          <Prose as="div" size="lg" className="docs-prose">
            <Markdown nodes={release.body} />
          </Prose>
        </section>
      ))}
    </Frame>
  );
}

function Home({ page }: { page: PageData }) {
  const home = page.home;
  return (
    <div className="docs-page" data-wide>
      <article className="docs-article docs-home">
        <header className="docs-hero">
          <Inline gap="3" align="center" wrap>
            <Badge tone="accent" dot>
              v{site.version}
            </Badge>
            {home?.latest && (
              <Link href={home.latest.route} size="sm" tone="neutral">
                What changed
              </Link>
            )}
          </Inline>
          <h1 className="docs-display">{site.tagline}</h1>
          <p className="docs-lead">{site.description}</p>
          <div className="docs-install">
            <CodeBlock language="sh" code={site.install} labels={{ region: "Install command" }} />
          </div>
          <Inline gap="3" wrap>
            <Button size="lg" variant="solid" tone="accent" iconEnd={arrowRight} href="/start/">
              Get started
            </Button>
            {site.pages.some((candidate) => candidate.id === "components") && (
              <Button size="lg" {...(icons.components ? { icon: icons.components } : {})} href="/components/">
                Browse components
              </Button>
            )}
            <Button size="lg" variant="ghost" icon={github} href={site.repo}>
              GitHub
            </Button>
          </Inline>
        </header>
        <Grid minItemWidth="16rem" gap="4" as="ul" className="docs-cards">
          {(home?.cards ?? []).map((card) => {
            const icon = icons[card.id];
            return (
              <Card key={card.id} as="li" variant="outline" href={card.route} className="docs-card">
                <Stack gap="2">
                  {icon && <Icon icon={icon} tone="accent" size="lg" />}
                  <strong>{card.title}</strong>
                  <span className="docs-small docs-clamp">{card.summary}</span>
                </Stack>
              </Card>
            );
          })}
        </Grid>
        {home?.latest && (
          <Card variant="soft" as="section" aria-label="Latest release">
            <Stack gap="3">
              <Inline gap="2" align="center" justify="between" wrap>
                <Inline gap="2" align="center">
                  <strong>Latest release</strong>
                  <Badge tone="neutral" variant="outline">
                    {home.latest.version}
                  </Badge>
                </Inline>
                <Inline gap="1">
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={github}
                    label="Releases on GitHub"
                    href={`${site.repo}/releases`}
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    icon={npm}
                    label="The package on npm"
                    href={site.npm}
                  />
                </Inline>
              </Inline>
              <ul className="docs-notes">
                {home.latest.notes.map((note) => (
                  <li key={note} className="docs-small docs-clamp">
                    {note}
                  </li>
                ))}
              </ul>
              <Link href={home.latest.route} size="sm">
                Read the full changelog
              </Link>
            </Stack>
          </Card>
        )}
        <Foot page={page} />
      </article>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="docs-page" data-wide>
      <article className="docs-article">
        <header className="docs-head">
          <p className="docs-eyebrow">Not found</p>
          <h1 className="docs-title">This page does not exist</h1>
          <p className="docs-lead">It may have moved. Search for it, or start from the overview.</p>
          <Inline gap="3">
            <Button variant="solid" tone="accent" href="/">
              Go to the overview
            </Button>
          </Inline>
        </header>
      </article>
    </div>
  );
}

export function Page({ page }: { page: PageData }) {
  switch (page.kind) {
    case "home":
      return <Home page={page} />;
    case "component":
      return <ComponentPage page={page} />;
    case "catalogue":
      return <Catalogue page={page} />;
    case "changelog":
      return <Changelog page={page} />;
    default:
      return <Doc page={page} />;
  }
}
