import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { withCustomConfig } from 'react-docgen-typescript';

// Type aliases recognised by the docs. The PropsTable links these names to
// /reference/types. Keep in sync with the markdown there.
const SPACE_LITERALS = [
  '"0"',
  '"0.5"',
  '"1"',
  '"1.5"',
  '"2"',
  '"3"',
  '"4"',
  '"5"',
  '"6"',
  '"8"',
  '"10"',
  '"12"',
  '"16"',
  '"20"',
  '"24"',
  '"32"',
  '"40"',
  '"48"',
  '"64"',
];
const SIZE_EXTRAS = ['"full"', '"auto"', '"fit"', '"screen"', '"prose"'];
const LENGTH_PARTS = ['`${number}px`', '`${number}%`', '`${number}rem`', '`${number}ch`'];
const DISPLAY_LITERALS = [
  '"block"',
  '"inline"',
  '"inline-block"',
  '"flex"',
  '"inline-flex"',
  '"grid"',
  '"inline-grid"',
  '"contents"',
  '"none"',
];
const ZINDEX_LITERALS = [
  '"hide"',
  '"base"',
  '"docked"',
  '"dropdown"',
  '"sticky"',
  '"overlay"',
  '"modal"',
  '"popover"',
  '"toast"',
  '"tooltip"',
];

function splitTopLevelUnion(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '<' || c === '(' || c === '{' || c === '[') depth++;
    else if (c === '>' || c === ')' || c === '}' || c === ']') depth--;
    else if (c === '|' && depth === 0) {
      parts.push(s.slice(last, i).trim());
      last = i + 1;
    }
  }
  parts.push(s.slice(last).trim());
  return parts.filter(Boolean);
}

function bucket(parts: string[]): string[] {
  const set = new Set(parts);

  const collapse = (literals: readonly string[], alias: string): void => {
    if (!literals.every((p) => set.has(p))) return;
    for (const p of literals) set.delete(p);
    set.add(alias);
  };

  collapse(LENGTH_PARTS, 'LengthValue');
  collapse(SPACE_LITERALS, 'SpaceToken');
  collapse(DISPLAY_LITERALS, 'Display');
  collapse(ZINDEX_LITERALS, 'ZIndexToken');

  // SizeValue subsumes SpaceToken + LengthValue + the five named aliases.
  if (set.has('SpaceToken') && set.has('LengthValue') && SIZE_EXTRAS.every((p) => set.has(p))) {
    set.delete('SpaceToken');
    set.delete('LengthValue');
    for (const p of SIZE_EXTRAS) set.delete(p);
    set.add('SizeValue');
  }

  return [...set];
}

function compressUnionTopLevel(s: string): string {
  const parts = splitTopLevelUnion(s);
  if (parts.length <= 1) return s;
  return bucket(parts).join(' | ');
}

export function compressType(raw: string): string {
  if (!raw) return raw;
  // Strip the noisiest react-docgen output — ref-forwarded components.
  let t = raw.replace(
    /ForwardRefExoticComponent<[\s\S]*?RefAttributes<[^<>]*(?:<[^<>]*>)?>>/g,
    'React.ComponentType',
  );
  // Recurse into `Name<inner>` payloads, then bucket the top-level union.
  // The regex strips one generic layer per pass; recursion terminates because
  // each call shortens the remaining string until no `<...>` remains.
  t = t.replace(
    /(\b[A-Za-z_][A-Za-z0-9_]*)<([^<>]*(?:<[^<>]*>[^<>]*)*)>/g,
    (_m, name, inner) => `${name}<${compressType(inner)}>`,
  );
  t = compressUnionTopLevel(t);
  return t;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(PKG_ROOT, '../..');
const DEFAULT_TSCONFIG = resolve(REPO_ROOT, 'packages/react/tsconfig.json');
const DEFAULT_SRC = resolve(REPO_ROOT, 'packages/react/src');

export interface PropRecord {
  name: string;
  type: string;
  description: string;
  required: boolean;
  defaultValue: string | null;
}
export interface ComponentRecord {
  name: string;
  description: string;
  filePath: string;
  props: PropRecord[];
}

export function extractProps(opts: { tsconfigPath: string; sourceRoot: string }): Record<
  string,
  ComponentRecord
> {
  const parser = withCustomConfig(opts.tsconfigPath, {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (p) => !p.parent || !/node_modules/.test(p.parent.fileName),
  });
  const files = glob.sync('**/*.tsx', {
    cwd: opts.sourceRoot,
    ignore: ['**/*.test.tsx', '**/*.stories.tsx', '**/__tests__/**', '**/_examples/**'],
    absolute: true,
  });
  const out: Record<string, ComponentRecord> = {};
  for (const file of files) {
    const components = parser.parse(file);
    for (const c of components) {
      if (out[c.displayName]) continue;
      out[c.displayName] = {
        name: c.displayName,
        description: c.description ?? '',
        filePath: file.replace(`${REPO_ROOT}/`, ''),
        props: Object.entries(c.props).map(([name, p]) => ({
          name,
          type: compressType(p.type?.name ?? 'unknown'),
          description: p.description ?? '',
          required: p.required ?? false,
          defaultValue: p.defaultValue?.value ?? null,
        })),
      };
    }
  }
  return out;
}

async function main() {
  const records = extractProps({ tsconfigPath: DEFAULT_TSCONFIG, sourceRoot: DEFAULT_SRC });
  const outPath = resolve(PKG_ROOT, 'src/generated/props.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(records, null, 2), 'utf8');
  process.stdout.write(`Wrote ${Object.keys(records).length} components to ${outPath}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
