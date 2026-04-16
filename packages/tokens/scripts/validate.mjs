import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const ajv = new Ajv({ allErrors: true, strict: false });
const schemaPath = resolve(root, 'tokens/schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

const files = await glob('tokens/**/*.json', {
  cwd: root,
  ignore: ['tokens/schema.json'],
  absolute: true,
});

let failed = false;
for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8'));
  if (!validate(data)) {
    console.error(`\u2717 ${f}`);
    for (const e of validate.errors ?? []) {
      console.error(`  ${e.instancePath} ${e.message}`);
    }
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}
// biome-ignore lint/suspicious/noConsole: validator output
console.log(`\u2713 Validated ${files.length} token file(s)`);
