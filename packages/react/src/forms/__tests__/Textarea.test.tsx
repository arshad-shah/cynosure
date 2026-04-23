import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  Textarea,
  TextareaActions,
  TextareaClearButton,
  TextareaCounter,
  TextareaField,
  TextareaFooter,
  TextareaResizeHandle,
  TextareaRoot,
} from '../Textarea/index.js';

describe('Textarea (convenience)', () => {
  it('renders a <textarea> with the configured rows', () => {
    render(<Textarea rows={5} placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta.rows).toBe(5);
  });

  it('typing updates the value', () => {
    render(<Textarea defaultValue="" placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'hello\nworld' } });
    expect(ta.value).toBe('hello\nworld');
  });

  it('applies the auto-resize class when autoResize is true', async () => {
    const { textareaAutoResize } = await import('../Textarea/Textarea.css.js');
    render(<Textarea autoResize placeholder="t" />);
    const ta = screen.getByPlaceholderText('t') as HTMLTextAreaElement;
    expect(ta.className).toContain(textareaAutoResize);
  });
});

describe('TextareaRoot + TextareaField', () => {
  it('renders a <textarea> inside Root that reflects defaultValue', () => {
    render(
      <TextareaRoot defaultValue="hi">
        <TextareaField aria-label="field" />
      </TextareaRoot>,
    );
    const ta = screen.getByLabelText('field') as HTMLTextAreaElement;
    expect(ta.tagName).toBe('TEXTAREA');
    expect(ta.value).toBe('hi');
  });

  it('typing propagates through Root context (controlled)', () => {
    function Controlled(): React.ReactElement {
      const [v, setV] = useState('');
      return (
        <TextareaRoot value={v} onChange={setV}>
          <TextareaField aria-label="field" />
        </TextareaRoot>
      );
    }
    render(<Controlled />);
    const ta = screen.getByLabelText('field') as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: 'hello' } });
    expect(ta.value).toBe('hello');
  });

  it('passes invalid to the textarea as aria-invalid', () => {
    render(
      <TextareaRoot defaultValue="" invalid>
        <TextareaField aria-label="field" />
      </TextareaRoot>,
    );
    const ta = screen.getByLabelText('field');
    expect(ta.getAttribute('aria-invalid')).toBe('true');
  });
});

describe('TextareaCounter', () => {
  it('renders the character count', () => {
    render(
      <TextareaRoot defaultValue="hello">
        <TextareaField aria-label="field" />
        <TextareaCounter />
      </TextareaRoot>,
    );
    // count of "hello" is 5
    expect(screen.getByTestId('textarea-counter').textContent).toContain('5');
  });

  it('renders count/limit when limit is set', () => {
    render(
      <TextareaRoot defaultValue="hi">
        <TextareaField aria-label="field" />
        <TextareaCounter limit={140} />
      </TextareaRoot>,
    );
    const counter = screen.getByTestId('textarea-counter');
    expect(counter.textContent).toContain('2');
    expect(counter.textContent).toContain('140');
  });

  it('enters warning state at >=80% of limit', () => {
    render(
      <TextareaRoot defaultValue={'x'.repeat(80)}>
        <TextareaField aria-label="field" />
        <TextareaCounter limit={100} />
      </TextareaRoot>,
    );
    expect(screen.getByTestId('textarea-counter').dataset.state).toBe('warning');
  });

  it('enters danger state over the limit', () => {
    render(
      <TextareaRoot defaultValue={'x'.repeat(101)}>
        <TextareaField aria-label="field" />
        <TextareaCounter limit={100} />
      </TextareaRoot>,
    );
    expect(screen.getByTestId('textarea-counter').dataset.state).toBe('danger');
  });

  it('exceeding limit sets aria-invalid on the field', () => {
    render(
      <TextareaRoot defaultValue={'x'.repeat(200)}>
        <TextareaField aria-label="field" />
        <TextareaCounter limit={100} />
      </TextareaRoot>,
    );
    expect(screen.getByLabelText('field').getAttribute('aria-invalid')).toBe('true');
  });
});

describe('TextareaClearButton', () => {
  it('is rendered but hidden when value is empty', () => {
    const { container } = render(
      <TextareaRoot defaultValue="">
        <TextareaField aria-label="field" />
        <TextareaClearButton />
      </TextareaRoot>,
    );
    const btn = container.querySelector('button[aria-label="Clear"]');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-hidden')).toBe('true');
    expect(btn?.getAttribute('tabindex')).toBe('-1');
  });

  it('is visible when there is content', () => {
    render(
      <TextareaRoot defaultValue="hi">
        <TextareaField aria-label="field" />
        <TextareaClearButton />
      </TextareaRoot>,
    );
    const btn = screen.getByRole('button', { name: /clear/i });
    expect(btn.getAttribute('aria-hidden')).not.toBe('true');
  });

  it('clicking clears the value', () => {
    function Controlled(): React.ReactElement {
      const [v, setV] = useState('hello');
      return (
        <TextareaRoot value={v} onChange={setV}>
          <TextareaField aria-label="field" />
          <TextareaClearButton />
        </TextareaRoot>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect((screen.getByLabelText('field') as HTMLTextAreaElement).value).toBe('');
  });

  it('adds data-clearable to the field when present', () => {
    render(
      <TextareaRoot defaultValue="">
        <TextareaField aria-label="field" />
        <TextareaClearButton />
      </TextareaRoot>,
    );
    expect(screen.getByLabelText('field').dataset.clearable).toBe('true');
  });
});

describe('TextareaFooter + Actions', () => {
  it('Footer renders its children', () => {
    render(
      <TextareaRoot defaultValue="">
        <TextareaField aria-label="field" />
        <TextareaFooter>
          <TextareaActions>
            <button type="button">Attach</button>
          </TextareaActions>
          <TextareaCounter limit={20} />
        </TextareaFooter>
      </TextareaRoot>,
    );
    expect(screen.getByRole('button', { name: 'Attach' })).toBeTruthy();
    expect(screen.getByTestId('textarea-counter')).toBeTruthy();
  });
});

describe('TextareaResizeHandle', () => {
  it('renders by default', () => {
    render(
      <TextareaRoot defaultValue="">
        <TextareaField aria-label="field" />
        <TextareaResizeHandle />
      </TextareaRoot>,
    );
    expect(screen.queryByTestId('textarea-resize-handle')).toBeTruthy();
  });

  it('is hidden when autoResize is on', () => {
    render(
      <TextareaRoot defaultValue="" autoResize>
        <TextareaField aria-label="field" />
        <TextareaResizeHandle />
      </TextareaRoot>,
    );
    expect(screen.queryByTestId('textarea-resize-handle')).toBeNull();
  });

  it('is hidden when resize="none"', () => {
    render(
      <TextareaRoot defaultValue="" resize="none">
        <TextareaField aria-label="field" />
        <TextareaResizeHandle />
      </TextareaRoot>,
    );
    expect(screen.queryByTestId('textarea-resize-handle')).toBeNull();
  });

  it('is hidden when disabled', () => {
    render(
      <TextareaRoot defaultValue="" disabled>
        <TextareaField aria-label="field" />
        <TextareaResizeHandle />
      </TextareaRoot>,
    );
    expect(screen.queryByTestId('textarea-resize-handle')).toBeNull();
  });

  it('is hidden when readOnly', () => {
    render(
      <TextareaRoot defaultValue="" readOnly>
        <TextareaField aria-label="field" />
        <TextareaResizeHandle />
      </TextareaRoot>,
    );
    expect(screen.queryByTestId('textarea-resize-handle')).toBeNull();
  });
});

describe('Textarea convenience wires feature props', () => {
  it('showCount + limit renders a counter', () => {
    render(<Textarea defaultValue="hi" showCount limit={140} aria-label="bio" />);
    const counter = screen.getByTestId('textarea-counter');
    expect(counter.textContent).toContain('2');
    expect(counter.textContent).toContain('140');
  });

  it('limit alone (without showCount) still renders a counter', () => {
    render(<Textarea defaultValue="hi" limit={140} aria-label="bio" />);
    expect(screen.getByTestId('textarea-counter')).toBeTruthy();
  });

  it('clearable renders a clear button that empties the value on click', () => {
    function Controlled(): React.ReactElement {
      const [v, setV] = useState('hello');
      return <Textarea value={v} onChange={setV} clearable aria-label="bio" />;
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect((screen.getByLabelText('bio') as HTMLTextAreaElement).value).toBe('');
  });

  it('toolbar renders in the footer', () => {
    render(
      <Textarea
        defaultValue=""
        aria-label="bio"
        toolbar={
          <button type="button" aria-label="attach">
            📎
          </button>
        }
      />,
    );
    expect(screen.getByRole('button', { name: 'attach' })).toBeTruthy();
  });

  it('resize="none" removes the resize handle', () => {
    render(<Textarea defaultValue="" resize="none" aria-label="bio" />);
    expect(screen.queryByTestId('textarea-resize-handle')).toBeNull();
  });
});
