import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/index.js';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '../Form/index.js';
import { Input } from '../Input/index.js';

describe('Form', () => {
  it('renders a <form> with noValidate by default', () => {
    const { container } = render(<Form aria-label="my-form" />);
    const form = container.querySelector('form') as HTMLFormElement;
    expect(form.noValidate).toBe(true);
  });

  it('honours an explicit noValidate={false}', () => {
    const { container } = render(<Form noValidate={false} aria-label="native" />);
    const form = container.querySelector('form') as HTMLFormElement;
    expect(form.noValidate).toBe(false);
  });

  it('forwards onSubmit events', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <Form onSubmit={onSubmit}>
        <button type="submit">submit</button>
      </Form>,
    );
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('FormField', () => {
  it('wires FormLabel htmlFor to the generated field id', () => {
    render(
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" />
        </FormControl>
      </FormField>,
    );
    const label = screen.getByText('Email').closest('label') as HTMLLabelElement;
    const input = screen.getByLabelText('Email');
    expect(input.id).toBeTruthy();
    expect(label.htmlFor).toBe(input.id);
    expect(input.id).toMatch(/^email-/);
  });

  it('wires FormDescription into aria-describedby and registers a stable id', () => {
    render(
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" />
        </FormControl>
        <FormDescription>We will never share your email.</FormDescription>
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const description = screen.getByText('We will never share your email.');
    expect(description.id).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('FormMessage renders nothing when children is empty', () => {
    render(
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" />
        </FormControl>
        <FormMessage>{undefined}</FormMessage>
      </FormField>,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    const input = screen.getByLabelText('Email');
    // No describedby registration for the missing message.
    expect(input.getAttribute('aria-describedby')).toBeNull();
  });

  it('FormMessage renders with role="alert" + describedby when invalid + has content', () => {
    render(
      <FormField name="email" invalid>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" defaultValue="nope" />
        </FormControl>
        <FormMessage>Not a valid email</FormMessage>
      </FormField>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Not a valid email');
    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('aria-describedby concatenates description + message ids in mount order', () => {
    render(
      <FormField name="pwd" invalid>
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" />
        </FormControl>
        <FormDescription>Must be 8+ characters</FormDescription>
        <FormMessage>Too short</FormMessage>
      </FormField>,
    );
    const input = screen.getByLabelText('Password');
    const description = screen.getByText('Must be 8+ characters');
    const alert = screen.getByRole('alert');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).not.toBeNull();
    const ids = (describedBy as string).split(/\s+/);
    expect(ids).toContain(description.id);
    expect(ids).toContain(alert.id);
    // description mounts before message → should precede it
    expect(ids.indexOf(description.id)).toBeLessThan(ids.indexOf(alert.id));
  });

  it('inherits disabled / required / name from FormField to FormControl child', () => {
    render(
      <FormField name="username" disabled required>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input />
        </FormControl>
      </FormField>,
    );
    const input = screen.getByLabelText(/Username/) as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.required).toBe(true);
    expect(input.name).toBe('username');
  });

  it('the FormControl child can override the inherited disabled/required/name', () => {
    render(
      <FormField name="x" disabled required>
        <FormLabel>X</FormLabel>
        <FormControl>
          <Input name="overridden" disabled={false} required={false} />
        </FormControl>
      </FormField>,
    );
    const input = screen.getByLabelText(/X/) as HTMLInputElement;
    expect(input.disabled).toBe(false);
    expect(input.required).toBe(false);
    expect(input.name).toBe('overridden');
  });

  it('aria-invalid is absent unless FormField.invalid is true', () => {
    const { rerender } = render(
      <FormField name="x">
        <FormLabel>X</FormLabel>
        <FormControl>
          <Input />
        </FormControl>
      </FormField>,
    );
    expect(screen.getByLabelText('X').getAttribute('aria-invalid')).toBeNull();
    rerender(
      <FormField name="x" invalid>
        <FormLabel>X</FormLabel>
        <FormControl>
          <Input />
        </FormControl>
      </FormField>,
    );
    expect(screen.getByLabelText('X').getAttribute('aria-invalid')).toBe('true');
  });

  it('FormLabel paints the required indicator from FormField.required', () => {
    render(
      <FormField name="email" required>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input />
        </FormControl>
      </FormField>,
    );
    const label = screen.getByText('Email').closest('label') as HTMLLabelElement;
    const indicator = within(label).getByText('*');
    expect(indicator.getAttribute('aria-hidden')).toBe('true');
  });

  it('FormControl preserves a pre-existing aria-describedby on the child', () => {
    render(
      <FormField name="email">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input aria-describedby="external-hint" />
        </FormControl>
        <FormDescription>helper</FormDescription>
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    const description = screen.getByText('helper');
    const describedBy = input.getAttribute('aria-describedby') as string;
    expect(describedBy.split(/\s+/)).toEqual(
      expect.arrayContaining(['external-hint', description.id]),
    );
  });

  it('integration: submits FormData through a full field stack', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      (onSubmit as unknown as { lastData?: Record<string, unknown> }).lastData = data;
    });

    function App(): React.ReactElement {
      const [email, setEmail] = useState('');
      const invalid = email.length > 0 && !email.includes('@');
      return (
        <Form onSubmit={onSubmit}>
          <FormField name="email" invalid={invalid} required>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input value={email} onChange={setEmail} />
            </FormControl>
            <FormDescription>We will never share your email.</FormDescription>
            <FormMessage>{invalid ? 'Needs an @' : undefined}</FormMessage>
          </FormField>
          <Button type="submit">Send</Button>
        </Form>
      );
    }

    render(<App />);
    await user.type(screen.getByLabelText(/Email/), 'me@example.com');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((onSubmit as unknown as { lastData?: Record<string, unknown> }).lastData).toEqual({
      email: 'me@example.com',
    });
  });
});
