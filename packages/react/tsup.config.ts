import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createConfig } from '@lumen/config/tsup.config.base';

const hookEntries = (): Record<string, string> => {
  const dir = join(process.cwd(), 'src/hooks');
  const entries: Record<string, string> = {};
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    const name = file.replace(/\.ts$/, '');
    entries[`hooks/${name}`] = `src/hooks/${file}`;
  }
  entries['hooks/index'] = 'src/hooks/index.ts';
  return entries;
};

export default createConfig({
  entry: {
    index: 'src/index.ts',
    'theme/index': 'src/theme/index.ts',
    'primitives/index': 'src/primitives/index.ts',
    'utils/index': 'src/utils/index.ts',
    ...hookEntries(),
  },
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@radix-ui/react-direction',
    '@radix-ui/react-slot',
    'class-variance-authority',
  ],
});
