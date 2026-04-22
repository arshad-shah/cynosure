export interface SidebarLink {
  title: string;
  href: string;
  status?: 'stable' | 'beta' | 'alpha' | 'experimental' | 'deprecated';
}
export interface SidebarSection {
  title: string;
  links: SidebarLink[];
  count?: number;
}

export const sidebar: SidebarSection[] = [
  {
    title: 'Getting started',
    links: [
      { title: 'Introduction', href: '/getting-started/introduction' },
      { title: 'Installation', href: '/getting-started/installation' },
      { title: 'Quickstart', href: '/getting-started/quickstart' },
      { title: 'RSC', href: '/getting-started/rsc' },
      { title: 'RTL', href: '/getting-started/rtl' },
    ],
  },
  {
    title: 'Foundations',
    links: [
      { title: 'Design principles', href: '/foundations/design-principles' },
      { title: 'Design tokens', href: '/foundations/design-tokens' },
      { title: 'Theming overview', href: '/foundations/theming-overview' },
      { title: 'Dark mode', href: '/foundations/dark-mode' },
      { title: 'Custom themes', href: '/foundations/custom-themes' },
      { title: 'Terminal theme recipe', href: '/foundations/terminal-theme-recipe' },
      { title: 'Accessibility', href: '/foundations/accessibility' },
    ],
  },
  {
    title: 'Primitives',
    links: [{ title: 'Button', href: '/components/button', status: 'stable' }],
  },
  {
    title: 'Forms',
    links: [
      { title: 'Input', href: '/components/input', status: 'stable' },
      { title: 'Textarea', href: '/components/textarea', status: 'stable' },
      { title: 'Checkbox', href: '/components/checkbox', status: 'stable' },
      { title: 'Radio', href: '/components/radio', status: 'stable' },
      { title: 'Switch', href: '/components/switch', status: 'stable' },
      { title: 'Select', href: '/components/select', status: 'stable' },
      { title: 'Combobox', href: '/components/combobox', status: 'stable' },
    ],
  },
  {
    title: 'Feedback',
    links: [
      { title: 'Badge', href: '/components/badge', status: 'stable' },
      { title: 'Alert', href: '/components/alert', status: 'stable' },
    ],
  },
  {
    title: 'Overlays',
    links: [
      { title: 'Dialog', href: '/components/dialog', status: 'stable' },
      { title: 'Tooltip', href: '/components/tooltip', status: 'stable' },
      { title: 'DropdownMenu', href: '/components/dropdown-menu', status: 'stable' },
    ],
  },
  {
    title: 'Navigation',
    links: [{ title: 'Tabs', href: '/components/tabs', status: 'stable' }],
  },
  {
    title: 'Data display',
    links: [
      { title: 'Card', href: '/components/card', status: 'stable' },
      { title: 'Accordion', href: '/components/accordion', status: 'stable' },
      { title: 'Table', href: '/components/table', status: 'stable' },
      { title: 'DataTable', href: '/components/data-table', status: 'beta' },
    ],
  },
  {
    title: 'Recipes',
    links: [
      { title: 'Index', href: '/recipes' },
      { title: 'Command palette', href: '/recipes/command-palette' },
      { title: 'Dashboard layout', href: '/recipes/dashboard-layout' },
      { title: 'Data table with filters', href: '/recipes/data-table-with-filters' },
      { title: 'Login form', href: '/recipes/login-form' },
      { title: 'Multi-step wizard', href: '/recipes/multi-step-wizard' },
      { title: 'Notification center', href: '/recipes/notification-center' },
      { title: 'Onboarding modal', href: '/recipes/onboarding-modal' },
      { title: 'Settings page', href: '/recipes/settings-page' },
    ],
  },
  { title: 'Changelog', links: [{ title: 'Releases', href: '/changelog' }] },
];
