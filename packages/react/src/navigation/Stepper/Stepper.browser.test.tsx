import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { stepperConnectorBefore, stepperMarker } from './Stepper.css.js';
import { Step, Stepper } from './Stepper.js';

/**
 * Real-browser layout check — the stepper lays its markers across a flex row
 * with connector arms set to `flex: 1`, so the marker positions and the arm
 * widths are decided entirely by real layout. jsdom collapses every box to
 * zero, so left-to-right ordering and the stretched connector width can only
 * be verified in a real engine. Runs across the Chromium/Firefox/WebKit
 * matrix in CI.
 */
test('Stepper lays markers left-to-right with stretched connectors', () => {
  const { container } = render(
    <div style={{ width: 600 }}>
      <Stepper currentStep={2}>
        <Step title="Cart" />
        <Step title="Shipping" />
        <Step title="Payment" />
        <Step title="Review" />
      </Stepper>
    </div>,
  );

  const markers = Array.from(
    container.querySelectorAll<HTMLElement>(`.${stepperMarker.split(' ')[0]}`),
  );
  expect(markers.length).toBe(4);

  // Each marker sits to the right of the previous one in a horizontal stepper.
  const lefts = markers.map((m) => m.getBoundingClientRect().left);
  for (let i = 1; i < lefts.length; i++) {
    expect(lefts[i]).toBeGreaterThan(lefts[i - 1]);
  }

  // The connector arm flexes to fill the gap between markers (nonzero width).
  const firstArm = container.querySelector<HTMLElement>(
    `.${stepperConnectorBefore.split(' ')[0]}[data-hidden="false"]`,
  );
  expect(firstArm).not.toBeNull();
  if (firstArm) {
    expect(firstArm.getBoundingClientRect().width).toBeGreaterThan(0);
  }
});
