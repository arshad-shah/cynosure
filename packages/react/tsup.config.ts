import { createConfig } from '@lumen/config/tsup.config.base';

export default createConfig({
  entry: {
    index: 'src/index.ts',
    'theme/index': 'src/theme/index.ts',
  },
  external: ['react', 'react-dom', 'react/jsx-runtime', '@radix-ui/react-direction'],
});
