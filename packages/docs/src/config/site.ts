import reactPkg from '@arshad-shah/cynosure-react/package.json' with { type: 'json' };

export const site = {
  name: 'Cynosure',
  description: 'Tiny, accessible, themeable React components.',
  url: 'https://cynosure.arshadshah.com',
  github: 'https://github.com/arshad-shah/cynosure',
  version: (reactPkg as { version: string }).version,
};
