import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '../Form/Form.js';
import { RHFField } from '../Form/rhf/RHFField.js';
import { Input } from '../Input/index.js';

type Values = { email: string };

describe('RHFField', () => {
  it('binds useController value + onChange to the inner Input', async () => {
    const user = userEvent.setup();

    function App(): React.ReactElement {
      const { control } = useForm<Values>({ defaultValues: { email: '' } });
      return (
        <Form>
          <RHFField control={control} name="email" label="Email">
            <Input />
          </RHFField>
        </Form>
      );
    }

    render(<App />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    await user.type(input, 'me@example.com');
    expect(input.value).toBe('me@example.com');
    // Name flows through so FormData works.
    expect(input.name).toBe('email');
  });

  it('surfaces validation errors via FormMessage + aria-invalid + aria-describedby', async () => {
    const user = userEvent.setup();
    const onValid = vi.fn<SubmitHandler<Values>>();

    function App(): React.ReactElement {
      const { control, handleSubmit } = useForm<Values>({
        defaultValues: { email: '' },
        mode: 'onSubmit',
      });
      return (
        <Form onSubmit={handleSubmit(onValid)}>
          <RHFField
            control={control}
            name="email"
            label="Email"
            rules={{ required: 'Email is required' }}
          >
            <Input />
          </RHFField>
          <button type="submit">Submit</button>
        </Form>
      );
    }

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email is required');
    expect(onValid).not.toHaveBeenCalled();

    const input = screen.getByLabelText('Email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('renders FormDescription when `description` is provided', () => {
    function App(): React.ReactElement {
      const { control } = useForm<Values>({ defaultValues: { email: '' } });
      return (
        <Form>
          <RHFField
            control={control}
            name="email"
            label="Email"
            description="We will never share your email."
          >
            <Input />
          </RHFField>
        </Form>
      );
    }

    render(<App />);
    expect(screen.getByText('We will never share your email.')).toBeInTheDocument();
  });
});
