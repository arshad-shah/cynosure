/**
 * Stand-ins for `storybook/test` on the site. Stories carry play tests and spies for the test runner; here a story is
 * only rendered, so the helpers do nothing: a spy is a plain function and an assertion is never reached.
 */
type Anything = (...args: unknown[]) => unknown;

const inert: Anything = new Proxy(() => inert, { get: () => inert }) as Anything;

/** A spy is a plain function, marked so an example's written code can leave it out. */
export const fn = (implementation?: Anything): Anything =>
  Object.assign((...args: unknown[]) => implementation?.(...args), { spy: true });
export const expect = inert;
export const within = inert;
export const spyOn = inert;
export const userEvent = inert;
export const waitFor = async () => undefined;
