import { createConfig } from '@lumen/config/tsup.config.base';

// Style Dictionary writes CSS artefacts to dist/css before tsup runs, so we
// must not clean dist here. The `clean` script wipes dist up-front.
export default createConfig({
  entry: { index: 'src/index.ts' },
  clean: false,
});
