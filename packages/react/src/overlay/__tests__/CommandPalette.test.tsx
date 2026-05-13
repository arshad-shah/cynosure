import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandMenu,
  CommandPalette,
  CommandSeparator,
  CommandShortcut,
} from '../CommandPalette/index.js';

describe('CommandPalette', () => {
  function Flat({ onSelect }: { onSelect?: () => void } = {}) {
    return (
      <CommandPalette label="Commands">
        <CommandInput placeholder="Find…" />
        <CommandList>
          <CommandEmpty>Nothing</CommandEmpty>
          <CommandGroup heading="Nav">
            <CommandItem onSelect={onSelect} description="Jump" shortcut="⌘ P">
              Go to profile
            </CommandItem>
            <CommandItem disabled>Disabled row</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem>Build</CommandItem>
          </CommandGroup>
        </CommandList>
        <CommandFooter />
      </CommandPalette>
    );
  }

  it('renders input, groups, and items', () => {
    render(<Flat />);
    expect(screen.getByPlaceholderText('Find…')).toBeInTheDocument();
    expect(screen.getByText('Nav')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Go to profile')).toBeInTheDocument();
    expect(screen.getByText('Build')).toBeInTheDocument();
  });

  it('renders the description and shortcut chips inside an item', () => {
    render(<Flat />);
    expect(screen.getByText('Jump')).toBeInTheDocument();
    // Shortcut splits "⌘ P" into two Kbd chips. The ⌘ glyph is rendered as a
    // lucide SVG icon (aria-hidden) by `Kbd`, so we assert on the keycap +
    // letter rather than the raw glyph.
    expect(screen.getByText('P')).toBeInTheDocument();
    expect(document.querySelectorAll('kbd').length).toBeGreaterThanOrEqual(2);
  });

  it('filters items based on the search input and shows empty state', () => {
    render(<Flat />);
    const input = screen.getByPlaceholderText('Find…');
    fireEvent.change(input, { target: { value: 'xyznope' } });
    expect(screen.getByText('Nothing')).toBeInTheDocument();
  });

  it('invokes onSelect when an item is clicked', () => {
    const onSelect = vi.fn();
    render(<Flat onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Go to profile'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('renders loading text inside CommandLoading', () => {
    render(
      <CommandPalette label="Commands" shouldFilter={false}>
        <CommandList>
          <CommandLoading text="Fetching" />
        </CommandList>
      </CommandPalette>,
    );
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });

  it('CommandShortcut splits a string on + and space', () => {
    render(<CommandShortcut>Ctrl+Shift+P</CommandShortcut>);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('Shift')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('CommandShortcut renders JSX children untouched', () => {
    render(
      <CommandShortcut>
        <span data-testid="custom">custom</span>
      </CommandShortcut>,
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});

describe('CommandMenu', () => {
  it('opens and renders items when controlled open=true', () => {
    render(
      <CommandMenu open label="Menu">
        <CommandInput placeholder="search" />
        <CommandList>
          <CommandItem>Open file</CommandItem>
        </CommandList>
      </CommandMenu>,
    );
    expect(screen.getByPlaceholderText('search')).toBeInTheDocument();
    expect(screen.getByText('Open file')).toBeInTheDocument();
  });

  it('does not render portal content when open=false', () => {
    render(
      <CommandMenu open={false} label="Menu">
        <CommandInput placeholder="search-hidden" />
      </CommandMenu>,
    );
    expect(screen.queryByPlaceholderText('search-hidden')).not.toBeInTheDocument();
  });

  it('toggles open state on ⌘K (uncontrolled)', () => {
    render(
      <CommandMenu label="Menu">
        <CommandInput placeholder="kbd-toggle" />
      </CommandMenu>,
    );
    expect(screen.queryByPlaceholderText('kbd-toggle')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByPlaceholderText('kbd-toggle')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.queryByPlaceholderText('kbd-toggle')).not.toBeInTheDocument();
  });
});
