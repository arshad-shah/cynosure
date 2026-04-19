import { createConfig } from '@arshad-shah/cynosure-config/tsup.config.base';

export default createConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  splitting: false,
  dts: true,
  clean: true,
  external: [],
  async onSuccess() {
    const { readFile, writeFile, chmod } = await import('node:fs/promises');
    const { join } = await import('node:path');
    const cliPath = join(process.cwd(), 'dist', 'cli.js');
    const shebang = '#!/usr/bin/env node\n';
    const existing = await readFile(cliPath, 'utf8');
    if (!existing.startsWith('#!')) {
      await writeFile(cliPath, shebang + existing);
    }
    await chmod(cliPath, 0o755);
  },
});
