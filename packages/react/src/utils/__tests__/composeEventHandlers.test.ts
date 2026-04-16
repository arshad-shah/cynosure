import { describe, expect, it, vi } from 'vitest';
import { composeEventHandlers } from '../composeEventHandlers.js';

type FakeEvent = { defaultPrevented: boolean };
const makeEvent = (): FakeEvent => ({ defaultPrevented: false });

describe('composeEventHandlers', () => {
  it('runs the caller-supplied handler first', () => {
    const calls: string[] = [];
    const their = () => calls.push('their');
    const ours = () => calls.push('ours');
    composeEventHandlers(their, ours)(makeEvent() as never);
    expect(calls).toEqual(['their', 'ours']);
  });

  it('short-circuits when the caller calls preventDefault()', () => {
    const ours = vi.fn();
    const their = (event: FakeEvent) => {
      event.defaultPrevented = true;
    };
    composeEventHandlers(their, ours)(makeEvent() as never);
    expect(ours).not.toHaveBeenCalled();
  });

  it('opt-out via checkForDefaultPrevented=false still runs ours', () => {
    const ours = vi.fn();
    const their = (event: FakeEvent) => {
      event.defaultPrevented = true;
    };
    composeEventHandlers(their, ours, { checkForDefaultPrevented: false })(makeEvent() as never);
    expect(ours).toHaveBeenCalledTimes(1);
  });

  it('tolerates missing handlers', () => {
    const ours = vi.fn();
    composeEventHandlers(undefined, ours)(makeEvent() as never);
    expect(ours).toHaveBeenCalledTimes(1);

    const their = vi.fn();
    composeEventHandlers(their, undefined)(makeEvent() as never);
    expect(their).toHaveBeenCalledTimes(1);
  });
});
