import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardImage,
  CardTitle,
} from '../Card/index.js';

describe('Card', () => {
  it('renders compound parts and sets orientation', () => {
    render(
      <Card orientation="horizontal" variant="elevated" interactive>
        <CardImage src="/hero.jpg" alt="Hero" />
        <CardHeader>
          <CardTitle>Cynosure</CardTitle>
          <CardDescription>Tiny library</CardDescription>
        </CardHeader>
        <CardBody>body</CardBody>
        <CardFooter>footer</CardFooter>
      </Card>,
    );
    const card = screen.getByRole('heading', { name: 'Cynosure' }).closest('div[data-orientation]');
    expect(card).toHaveAttribute('data-orientation', 'horizontal');
    expect(card).toHaveAttribute('data-interactive', 'true');
    expect(screen.getByText('Tiny library')).toBeInTheDocument();
    expect(screen.getByAltText('Hero')).toBeInTheDocument();
  });

  it('interactive card is focusable', () => {
    render(
      <Card interactive data-testid="card">
        <CardBody>click me</CardBody>
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveAttribute('tabindex', '0');
  });
});
