import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '../Breadcrumb/index.js';

describe('Breadcrumb', () => {
  it('renders every item with interleaved separators', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Cynosure</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    // separators are role="presentation" so only real items show up as listitems
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(within(nav).getByText('Cynosure').closest('li')).toHaveAttribute('aria-current', 'page');
  });

  it('collapses middle items when maxItems is exceeded', () => {
    render(
      <Breadcrumb maxItems={3} itemsBeforeCollapse={1} itemsAfterCollapse={1}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/a">A</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/b">B</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/c">C</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrent>
          <BreadcrumbPage>Cynosure</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    // Home + ellipsis placeholder + Cynosure should remain.
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'A' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'B' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'C' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    expect(screen.getByText('Cynosure')).toBeInTheDocument();
  });

  it('renders BreadcrumbEllipsis standalone with an accessible label', () => {
    render(<BreadcrumbEllipsis label="More breadcrumbs" />);
    expect(screen.getByRole('button', { name: 'More breadcrumbs' })).toBeInTheDocument();
  });
});
