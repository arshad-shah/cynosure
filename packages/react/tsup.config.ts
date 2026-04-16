import { createConfig } from '@lumen/config/tsup.config.base';

export default createConfig({
  entry: {
    index: 'src/index.ts',
  },
});
