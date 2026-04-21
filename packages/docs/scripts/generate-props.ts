import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';
import { withCustomConfig } from 'react-docgen-typescript';

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
          type: p.type?.name ?? 'unknown',
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
